import { expect, test } from '@playwright/test'

const ROUTES = ['split', 'calc', 'costs', 'scenarios', 'reverse', 'benefits', 'data', 'about']

// PRD "Layout": works from 360 px phones. A page wider than the screen makes mobile browsers zoom out,
// which also moves the fixed bottom navigation, so every screen must fit, even with a wide fallback font.
test.describe('no horizontal scrolling at 360 px', () => {
  test.use({ viewport: { width: 360, height: 780 } })

  for (const route of ROUTES) {
    test(`#/${route} fits the screen`, async ({ page }) => {
      await page.goto(`./#/${route}`)
      await expect(page.getByRole('main').getByRole('heading', { level: 1 }).first()).toBeVisible()
      await page.addStyleTag({ content: 'body, input, button, select { font-family: "DejaVu Sans", Verdana, sans-serif !important; letter-spacing: 0.03em }' })
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(360)
    })
  }
})
