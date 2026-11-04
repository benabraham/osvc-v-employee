import { expect, test, type Page } from '@playwright/test'
import { defaultInputs } from '../src/model/inputs'
import { encodeSharedCalculation } from '../src/state/share'

/** The main navigation in the order of the screens, with the label of each screen in Czech. */
const SCREENS = [
  { route: 'split', label: 'Rozdělit fakturu' },
  { route: 'calc', label: 'Výpočet' },
  { route: 'costs', label: 'Náklady' },
  { route: 'scenarios', label: 'Scénáře' },
  { route: 'reverse', label: 'Cílový příjem' },
  { route: 'benefits', label: 'Dávky' },
  { route: 'data', label: 'Data a sdílení' },
  { route: 'about', label: 'O aplikaci' },
] as const

const mainNavigation = (page: Page) => page.getByRole('navigation', { name: 'Hlavní navigace' })

/** Clicks a screen in the navigation; on phones the less used screens sit behind "Více". */
const openScreen = async ({ page, label }: { page: Page; label: string }) => {
  const link = mainNavigation(page).getByRole('link', { name: label })
  if (!(await link.isVisible())) await mainNavigation(page).getByRole('button', { name: 'Více' }).click()
  await link.click()
}

test('every screen is reachable from the navigation and titles the page', async ({ page }) => {
  await page.goto('./')
  for (const screen of SCREENS) {
    await openScreen({ page, label: screen.label })
    await expect(page).toHaveURL(new RegExp(`#/${screen.route}$`))
    // a CSS locator, because on phones the link of a screen behind "Více" is hidden once the menu closes
    await expect(page.locator(`nav a[href="#/${screen.route}"]`)).toHaveAttribute('aria-current', 'page')
    await expect(page).toHaveTitle(`${screen.label} · OSVČ vs. zaměstnanec`)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 }).first()).toBeVisible()
  }
})

test('the year switcher changes the tax year and the footer follows it', async ({ page }) => {
  await page.goto('./#/calc')
  const yearSelect = page.getByRole('combobox', { name: 'Daňový rok' })
  await expect(yearSelect).toHaveValue('2026')
  await expect(page.getByRole('contentinfo').getByText('Hodnoty platné od 1. 1. 2026')).toBeVisible()

  await yearSelect.selectOption('2025')
  await expect(page.getByRole('contentinfo').getByText('Hodnoty platné od 1. 1. 2025')).toBeVisible()
  await expect(page.getByRole('contentinfo').getByText(/z minulého roku/)).toBeVisible()
})

test('switching to English translates the navigation and the page language', async ({ page, isMobile }) => {
  test.skip(isMobile, 'on phones the language switch is on the Data screen (covered by data.spec.ts)')
  await page.goto('./#/calc')
  await page.getByRole('button', { name: 'English' }).click()
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page).toHaveTitle('Calculation · Freelancer vs. employee')

  await page.getByRole('button', { name: 'Čeština' }).click()
  await expect(mainNavigation(page).getByRole('link', { name: 'O aplikaci' })).toBeVisible()
})

test('a shared link opens the calculator with its year and shows the confirmation', async ({ page }) => {
  const token = encodeSharedCalculation({ year: 2025, inputs: { ...defaultInputs(), hourlyRate: 777 } })
  await page.goto(`./#/share/${token}`)
  await expect(page).toHaveURL(/#\/calc$/)
  await expect(mainNavigation(page).getByRole('link', { name: 'Výpočet' })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('combobox', { name: 'Daňový rok' })).toHaveValue('2025')
  await expect(page.getByText('Načteno ze sdíleného odkazu')).toBeVisible()
})

test('the theme select sets the theme on the page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'on phones the theme is set on the Data screen')
  await page.goto('./#/about')
  await page.getByRole('combobox', { name: 'Motiv' }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('combobox', { name: 'Motiv' }).selectOption('system')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme')
})
