/**
 * E2E tests for Three.js Micro-Frontend Showcase
 *
 * Full coverage: dynamically generates tests for all 61 demos from the registry.
 * Organized by category. Uses local Chrome via channel: 'chrome'.
 *
 * Large-asset demos get extended timeouts (60s).
 */

import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// Load registry
// ---------------------------------------------------------------------------
const registryPath = resolve(__dirname, '../src/registry/demos.json')
const registry = JSON.parse(readFileSync(registryPath, 'utf-8'))

// ---------------------------------------------------------------------------
// Large-asset demos that need extended timeouts
// ---------------------------------------------------------------------------
const LARGE_ASSET_DEMOS = new Set([
  'cube-camera-envmap',
  'snowy-forest',
  'bone-animation',
  'car-config',
  'gltf-draco-test',
  'hdr-background',
  '3d-music-player',
  't-shirt-design',
])

function getCanvasTimeout(demoName) {
  return LARGE_ASSET_DEMOS.has(demoName) ? 60000 : 15000
}

function getTestTimeout(demoName) {
  return LARGE_ASSET_DEMOS.has(demoName) ? 180000 : 60000
}

// ---------------------------------------------------------------------------
// Canvas detection helper – checks direct <canvas> and inside iframes
// ---------------------------------------------------------------------------
async function waitForCanvas(page, timeout = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    // Direct canvas
    const direct = page.locator('canvas')
    if (await direct.count() > 0) return true

    // Canvas inside iframes (sub-apps in shell, or demo pages with nested iframes)
    const iframes = page.locator('iframe')
    const cnt = await iframes.count()
    for (let i = 0; i < cnt; i++) {
      try {
        const frame = await iframes.nth(i).elementHandle()
        if (frame) {
          const f = await frame.contentFrame()
          if (f && await f.locator('canvas').count() > 0) return true
        }
      } catch {}
    }
    await page.waitForTimeout(500)
  }
  return false
}

// ---------------------------------------------------------------------------
// Console error capture
// ---------------------------------------------------------------------------
function setupConsoleErrorCapture(page) {
  const errors = []
  page.on('pageerror', err => errors.push('PAGE: ' + err.message))
  page.on('console', msg => {
    if (msg.type() === 'error') {
      // Skip generic resource-load errors (we capture specific URLs via response/requestfailed)
      if (msg.text().includes('Failed to load resource')) return
      errors.push('CONSOLE: ' + msg.text())
    }
  })
  page.on('response', resp => {
    if (resp.status() === 404 && resp.url().includes('localhost')) {
      // Skip favicon noise
      if (resp.url().includes('favicon')) return
      errors.push('404: ' + resp.url().replace(/^https?:\/\/[^\/]+/, ''))
    }
  })
  page.on('requestfailed', req => {
    const url = req.url()
    // Only capture external failures (not our demo server resources)
    if (!url.includes('localhost')) {
      errors.push('REQFAIL: ' + url)
    }
  })
  return errors
}

// External URLs that produce noise (trackers, CDN ads, etc.) — not demo bugs
const ERROR_WHITELIST = [
  /sogou\.com/,
  /qq\.com/,
  /favicon\.ico/,
  /ERR_CONNECTION_CLOSED/,  // css3d-computer external tracker
  /ERR_FAILED.*hotlist/,     // css3d-computer external tracker
]

function filterWhitelistedErrors(errors) {
  return errors.filter(err => {
    for (const pattern of ERROR_WHITELIST) {
      if (pattern.test(err)) return false
    }
    return true
  })
}

// ---------------------------------------------------------------------------
// Group demos by category
// ---------------------------------------------------------------------------
const categories = {}
for (const demo of registry) {
  const cat = demo.category || 'other'
  if (!categories[cat]) categories[cat] = []
  categories[cat].push(demo)
}

const CATEGORY_LABELS = {
  basic: '基础篇 (basic)',
  advanced: '进阶篇 (advanced)',
  animation: '动画与应用 (animation)',
  effect: '3D效果 (effect)',
  interaction: '交互与标注 (interaction)',
  'react-integration': 'React集成 (react-integration)',
  other: '其他 (other)',
}

const CATEGORY_ORDER = ['basic', 'advanced', 'animation', 'effect', 'interaction', 'react-integration', 'other']

// ---------------------------------------------------------------------------
// Full coverage: one test.describe per category, one test per demo
// ---------------------------------------------------------------------------
for (const cat of CATEGORY_ORDER) {
  const demos = categories[cat]
  if (!demos || demos.length === 0) continue

  test.describe(CATEGORY_LABELS[cat] || cat, () => {
    for (const demo of demos) {
      const canvasTimeout = getCanvasTimeout(demo.name)
      const testTimeoutMs = getTestTimeout(demo.name)

      test(`${demo.name} (${demo.type})`, async ({ page }) => {
        test.setTimeout(testTimeoutMs)

        // Capture console errors during page load
        const consoleErrors = setupConsoleErrorCapture(page)

        await page.goto(`/demos/${demo.name}/index.html`, { waitUntil: 'networkidle', timeout: 60000 })
        await page.waitForTimeout(3000)

        // Assert canvas rendered
        const hasCanvas = await waitForCanvas(page, canvasTimeout)
        expect(hasCanvas, `${demo.name}: canvas should render within ${canvasTimeout / 1000}s`).toBeTruthy()

        // Assert no console errors (excluding whitelisted external noise)
        const realErrors = filterWhitelistedErrors(consoleErrors)
        expect(realErrors, `${demo.name}: should have no console errors, got: ${JSON.stringify(realErrors)}`).toEqual([])
      })
    }
  })
}

// ---------------------------------------------------------------------------
// Shell navigation tests
// ---------------------------------------------------------------------------
test.describe('Shell navigation', () => {
  test('shell loads demo registry and displays sidebar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForSelector('.sidebar', { timeout: 10000 })
    await page.waitForSelector('.demo-item', { timeout: 15000 })

    const count = await page.locator('.demo-item').count()
    expect(count).toBeGreaterThan(0)
  })

  test('switching demos via sidebar click', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForSelector('.demo-item', { timeout: 15000 })

    // Expand first category if collapsed
    const firstCategory = page.locator('.category-header').first()
    await firstCategory.click()
    await page.waitForTimeout(300)

    // Click first demo
    const firstDemo = page.locator('.demo-item').first()
    await firstDemo.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('iframe')).toBeAttached({ timeout: 10000 })

    // Click second demo if available
    const count = await page.locator('.demo-item').count()
    if (count >= 2) {
      await page.locator('.demo-item').nth(1).click()
      await page.waitForTimeout(2000)
      await expect(page.locator('iframe')).toBeAttached({ timeout: 5000 })
    }
  })

  test('hash route restores demo selection on reload', async ({ page }) => {
    // Navigate with a hash for a known demo
    await page.goto('/#/first-scene', { waitUntil: 'networkidle' })
    await page.waitForSelector('.demo-item', { timeout: 15000 })
    await page.waitForTimeout(1000)

    // The first-scene demo item should be active
    const activeItem = page.locator('.demo-item.active')
    await expect(activeItem).toBeAttached({ timeout: 5000 })
  })
})

// ---------------------------------------------------------------------------
// Sidebar collapse tests
// ---------------------------------------------------------------------------
test.describe('Sidebar collapse', () => {
  test('toggle collapses and expands sidebar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForSelector('.sidebar', { timeout: 10000 })

    // Sidebar should be visible (expanded) initially
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()

    // Click toggle to collapse
    const toggleBtn = page.locator('.sidebar-toggle-btn')
    await toggleBtn.click()
    await page.waitForTimeout(500)

    // Sidebar should have collapsed class
    await expect(sidebar).toHaveClass(/collapsed/)

    // Floating toggle button should appear
    const floatBtn = page.locator('.sidebar-float-toggle')
    await expect(floatBtn).toBeVisible()

    // Click floating button to expand
    await floatBtn.click()
    await page.waitForTimeout(500)

    // Sidebar should be expanded again (no collapsed class)
    await expect(sidebar).not.toHaveClass(/collapsed/)
  })

  test('collapse state persists across reload', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForSelector('.sidebar-toggle-btn', { timeout: 10000 })

    // Collapse the sidebar
    await page.locator('.sidebar-toggle-btn').click()
    await page.waitForTimeout(500)

    // Reload
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForSelector('.sidebar', { timeout: 10000 })

    // Sidebar should still be collapsed
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toHaveClass(/collapsed/)
  })
})
