import { expect, test } from '@playwright/test'

test('changing the hourly rate to 1000 shows 65 100 Kč net per month', async ({ page }) => {
  await page.goto('./#/calc')
  await page.getByLabel('Hodinová sazba').fill('1000')
  const headline = page.locator('[aria-live="polite"]').filter({ hasText: 'Čistého měsíčně' })
  await expect(headline).toContainText(/65\s100\sKč/)
})
