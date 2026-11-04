import { expect, test } from '@playwright/test'

test('the app shell loads with its title and heading', async ({ page }) => {
  await page.goto('./')
  await expect(page).toHaveTitle(/OSVČ vs. zaměstnanec/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('the PWA manifest is linked and the service worker is served', async ({ page, request }) => {
  await page.goto('./')
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /manifest\.webmanifest$/)

  const manifestResponse = await request.get('manifest.webmanifest')
  expect(manifestResponse.status()).toBe(200)

  const serviceWorkerResponse = await request.get('sw.js')
  expect(serviceWorkerResponse.status()).toBe(200)
})
