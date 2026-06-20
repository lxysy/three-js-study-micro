import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5176'

test.describe('fix-deploy-console-errors — importmap + crash verification', () => {

  test('3.1 importmap demo loads without "three" resolution error', async ({ page }) => {
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(BASE)
    await page.locator('.demo-item', { hasText: 'first-scene' }).click()
    await page.waitForTimeout(5000)

    // Check no "three" module specifier error
    const moduleErrors = errors.filter(e =>
      e.includes('module specifier') || e.includes('Failed to resolve')
    )
    expect(moduleErrors).toHaveLength(0)
  })

  test('3.2 all importmap demos load without module errors', async ({ page }) => {
    test.setTimeout(180000)
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(BASE)

    const importmapDemos = [
      'buffer-geometry', 'curve', 'data-gui', 'first-scene',
      'generate-geometry', 'house', 'light-helper', 'material-color-texture',
      'perspective-camera', 'point-line-mesh', 'scene-group', 'texture-uv',
      'gltf-model', 'gltf-pipeline-test', 'mountain-terrain',
      'vertex-normal', 'tube-travel', 'tween-animation'
    ]

    for (const name of importmapDemos) {
      const item = page.locator('.demo-item', { hasText: name })
      if (await item.count() > 0) {
        await page.evaluate((n) => {
          const items = document.querySelectorAll('.demo-item')
          for (const item of items) {
            if (item.textContent?.includes(n)) {
              item.scrollIntoView({ block: 'center' })
              item.click()
              break
            }
          }
        }, name)
        await page.waitForTimeout(1000)
      }
    }

    await page.waitForTimeout(3000)
    const moduleErrors = errors.filter(e =>
      e.includes('module specifier') || e.includes('Failed to resolve')
    )
    console.log(`Importmap demos tested. Module errors: ${moduleErrors.length}`)
    expect(moduleErrors).toHaveLength(0)
  })

  test('3.3 mixed types rapid switching — no crash', async ({ page }) => {
    test.setTimeout(120000)
    const errors = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(BASE)

    // Race through 25 demos of all types
    for (let i = 0; i < 25; i++) {
      await page.evaluate((idx) => {
        const items = document.querySelectorAll('.demo-item')
        if (idx < items.length) {
          items[idx].scrollIntoView({ block: 'center' })
          // Expand parent if collapsed
          const group = items[idx].closest('.category-group')
          const arrow = group?.querySelector('.category-header .arrow')
          if (arrow && !arrow.classList.contains('open')) {
            group.querySelector('.category-header').click()
          }
          items[idx].click()
        }
      }, i)
      await page.waitForTimeout(300)
    }

    await page.waitForTimeout(2000)

    // Page must still be responsive
    const sidebar = page.locator('.sidebar')
    await expect(sidebar).toBeVisible()

    const viewer = page.locator('.demo-viewer')
    await expect(viewer).toBeVisible()

    console.log(`Rapid switch: ${errors.length} page errors, page alive`)
  })
})
