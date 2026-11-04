import { expect, test, type Page } from '@playwright/test'

/** The key the app stores its state under (src/state/storage.ts). */
const STORAGE_KEY = 'osvc-v-employee:v1'

/**
 * Sets the 2026 calculation to the given hourly rate by writing the stored state. Only the fields given are changed:
 * the saved scenarios and the rest of the state stay as they are. The page must be reloaded to read it.
 */
const setHourlyRate = async (page: Page, hourlyRate: number) => {
  await page.evaluate(
    ({ key, hourlyRate }) => {
      const raw = window.localStorage.getItem(key)
      const stored = raw ? JSON.parse(raw) : {}
      window.localStorage.setItem(
        key,
        JSON.stringify({
          ...stored,
          hasCompletedSetup: true,
          activeYear: 2026,
          syncInputs: true,
          sharedInputs: { ...stored.sharedInputs, hourlyRate },
        }),
      )
    },
    { key: STORAGE_KEY, hourlyRate },
  )
  await page.reload()
}

/** Reads a Czech money text such as "39 700 Kč" as a number. */
const kroneValue = (text: string | null) => Number((text ?? '').replace(/[^\d]/g, ''))

test('two saved scenarios with different rates appear in the comparison', async ({ page }) => {
  await page.goto('./#/scenarios')
  await setHourlyRate(page, 650)
  await page.getByRole('button', { name: 'Uložit scénář' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'je uložen' })).toContainText('650 Kč/h, 2026')

  await setHourlyRate(page, 800)
  await page.getByLabel('Název scénáře').fill('Vyšší sazba')
  await page.getByRole('button', { name: 'Uložit scénář' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'je uložen' })).toContainText('Vyšší sazba')

  await expect(page.getByRole('button', { name: 'Načíst scénář „650 Kč/h, 2026“' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Načíst scénář „Vyšší sazba“' })).toBeVisible()

  const isDesktop = (page.viewportSize()?.width ?? 0) >= 960
  if (isDesktop) {
    const table = page.getByRole('table', { name: 'Porovnání scénářů a aktuálního výpočtu' })
    await expect(table.getByRole('columnheader', { name: '650 Kč/h, 2026' })).toBeVisible()
    await expect(table.getByRole('columnheader', { name: 'Vyšší sazba' })).toBeVisible()

    const netCells = table.getByRole('row', { name: /Čistý příjem měsíčně/ }).getByRole('cell')
    const net650 = kroneValue(await netCells.nth(1).textContent())
    const net800 = kroneValue(await netCells.nth(2).textContent())
    expect(net650).toBeGreaterThan(0)
    expect(net800).toBeGreaterThan(net650)
    await expect(netCells.nth(2)).toContainText('nejvyšší čistý příjem')
  } else {
    const region = page.getByRole('region', { name: 'Porovnání scénářů, posouvejte šipkami nebo přejetím' })
    await expect(region).toHaveAttribute('tabindex', '0')
    await expect(region.getByRole('heading', { name: '650 Kč/h, 2026' })).toBeAttached()
    await expect(region.getByRole('heading', { name: 'Vyšší sazba' })).toBeAttached()
  }
})
