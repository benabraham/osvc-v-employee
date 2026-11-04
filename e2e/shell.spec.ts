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

test('every screen is reachable from the navigation and titles the page', async ({ page }) => {
  await page.goto('./')
  for (const screen of SCREENS) {
    await mainNavigation(page).getByRole('link', { name: screen.label }).click()
    await expect(page).toHaveURL(new RegExp(`#/${screen.route}$`))
    await expect(mainNavigation(page).getByRole('link', { name: screen.label })).toHaveAttribute('aria-current', 'page')
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

test('switching to English translates the navigation and the page language', async ({ page }) => {
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

test('the theme select sets the theme on the page', async ({ page }) => {
  await page.goto('./#/about')
  await page.getByRole('combobox', { name: 'Motiv' }).selectOption('dark')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('combobox', { name: 'Motiv' }).selectOption('system')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme')
})
