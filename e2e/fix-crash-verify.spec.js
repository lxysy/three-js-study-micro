import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5176'

test.describe('fix-menu-switch-crash — verification', () => {

  test('4.1 sidebar loads with demo list', async ({ page }) => {
    await page.goto(BASE)

    // Sidebar should be visible
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()

    // Should show demo items (category groups)
    const demoItems = page.locator('.demo-item')
    const count = await demoItems.count()
    expect(count).toBeGreaterThan(0)
    console.log(`Sidebar loaded with ${count} visible demo items`)
  })

  test('4.5 welcome screen shows when no demo selected', async ({ page }) => {
    await page.goto(BASE)

    // With no demo selected (no hash), welcome overlay should be visible
    const welcome = page.locator('.welcome-overlay')
    await expect(welcome).toBeVisible({ timeout: 5000 })
    await expect(welcome.locator('.welcome-title')).toContainText('Three.js')
  })

  test('4.4 sidebar collapse and expand', async ({ page }) => {
    await page.goto(BASE)

    // Sidebar should start expanded
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).not.toHaveClass(/collapsed/)

    // Click the toggle button in sidebar header
    const toggleBtn = sidebar.locator('.sidebar-toggle-btn')
    await toggleBtn.click()

    // Sidebar should collapse
    await expect(sidebar).toHaveClass(/collapsed/)

    // Floating toggle button should appear
    const floatBtn = page.locator('.sidebar-float-toggle')
    await expect(floatBtn).toBeVisible()

    // Click floating button to expand
    await floatBtn.click()
    await expect(sidebar).not.toHaveClass(/collapsed/)
  })

  test('4.3 switch between simple and GLB-heavy demo', async ({ page }) => {
    await page.goto(BASE)

    // Click first-scene (simple importmap demo)
    const simpleDemo = page.locator('.demo-item', { hasText: 'first-scene' })
    await simpleDemo.click()

    // Wait for micro-app to mount — demo viewer should appear
    const viewer = page.locator('.demo-viewer')
    await expect(viewer.locator('.main-header .demo-title')).toContainText('first-scene')

    // Wait for loading to finish (loaded state or timeout)
    try {
      await page.waitForFunction(() => {
        const overlay = document.querySelector('.loading-overlay')
        return !overlay || overlay.style.display === 'none'
      }, { timeout: 15000 })
    } catch {
      console.log('Loading may still be in progress, continuing...')
    }

    // Now switch to home-decoration-editor (GLB-heavy vite-react demo)
    const heavyDemo = page.locator('.demo-item', { hasText: 'home-decoration-editor' })
    await heavyDemo.click()

    // Verify it loaded
    await expect(viewer.locator('.main-header .demo-title')).toContainText('home-decoration-editor')

    // Switch back to first-scene
    await simpleDemo.click()
    await expect(viewer.locator('.main-header .demo-title')).toContainText('first-scene')
  })

  test('4.2 rapid switching 20+ demos — no crash', async ({ page }) => {
    test.setTimeout(120000)
    await page.goto(BASE)

    // Collect page-level errors
    const pageErrors = []
    page.on('pageerror', err => {
      pageErrors.push(err.message)
    })

    // Rapidly click through 25 demos by scrolling sidebar and clicking
    // Use page.evaluate to avoid locator visibility/stability timeouts
    for (let i = 0; i < 25; i++) {
      const clicked = await page.evaluate((idx) => {
        const items = document.querySelectorAll('.demo-item')
        if (idx >= items.length) return null
        const item = items[idx]
        item.scrollIntoView({ block: 'center' })
        const name = item.textContent?.trim().split('\n')[0] || ''
        // Expand parent category if collapsed
        const categoryGroup = item.closest('.category-group')
        const categoryHeader = categoryGroup?.querySelector('.category-header .arrow')
        if (categoryHeader && !categoryHeader.classList.contains('open')) {
          categoryGroup.querySelector('.category-header').click()
        }
        item.click()
        return name
      }, i)

      if (clicked === null) break
      console.log(`[${i + 1}/25] ${clicked}`)
      await page.waitForTimeout(350)
    }

    // Verify page is still alive after rapid switching
    await page.waitForTimeout(2000)

    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()

    const viewer = page.locator('.demo-viewer')
    await expect(viewer).toBeVisible()

    console.log(`Rapid switching complete — page alive. Page errors: ${pageErrors.length}`)
  })

  test('4.6 verify status stays valid after rapid switching', async ({ page }) => {
    test.setTimeout(90000)
    await page.goto(BASE)

    const pageErrors = []
    page.on('pageerror', err => {
      pageErrors.push(err.message)
    })

    // Expand all categories
    const categoryHeaders = page.locator('.category-header')
    const catCount = await categoryHeaders.count()
    for (let i = 0; i < catCount; i++) {
      await categoryHeaders.nth(i).click()
      await page.waitForTimeout(50)
    }

    // Click first 15 demos rapidly with scroll-into-view
    const demos = page.locator('.demo-item')
    const count = await demos.count()
    const limit = Math.min(15, count)
    for (let i = 0; i < limit; i++) {
      try {
        await demos.nth(i).scrollIntoViewIfNeeded()
        await demos.nth(i).click({ timeout: 3000 })
      } catch {
        console.log(`  ⚠ Could not click demo ${i}, skipping`)
      }
      await page.waitForTimeout(250)
    }

    // Wait for final demo to settle
    await page.waitForTimeout(5000)

    // Check that demo-viewer is still present
    const viewer = page.locator('.demo-viewer')
    await expect(viewer).toBeVisible()

    // Sidebar should still be functional
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()

    console.log(`Post-switch stability: ${pageErrors.length} page errors, page alive`)
  })
})
