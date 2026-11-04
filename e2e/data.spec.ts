import { expect, test } from '@playwright/test'

test('switching the language on the data screen shows English labels', async ({ page }) => {
  await page.goto('./#/data')
  await expect(page.getByRole('heading', { level: 1, name: 'Data a sdílení' })).toBeVisible()

  await page.getByRole('radio', { name: 'English' }).check()

  await expect(page.getByRole('heading', { level: 1, name: 'Data and sharing' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Export data' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Delete all data' })).toBeVisible()
})

test('export downloads the backup as a dated JSON file', async ({ page }) => {
  await page.goto('./#/data')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportovat data' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/^osvc-v-zamestnanec-\d{4}-\d{2}-\d{2}\.json$/)
})
