import { expect, test } from '@playwright/test'

test('typing an invoice amount shows what can be spent', async ({ page }) => {
  await page.goto('./#/split')

  await page.getByLabel('Částka faktury').fill('20000')

  await expect(page.getByText('můžeš utratit')).toBeVisible()
})
