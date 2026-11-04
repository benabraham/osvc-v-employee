// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initialState } from '../state/schema'
import { store } from './context'
import { App } from './app'
import { route } from './router'
import { toasts } from './toast'

// The other screens are built by their own authors; the shell only needs them to exist
vi.mock('../screens/calc/calc-screen', () => ({ CalcScreen: () => null }))
vi.mock('../screens/split/split-screen', () => ({ SplitScreen: () => null }))
vi.mock('../screens/costs/costs-screen', () => ({ CostsScreen: () => null }))
vi.mock('../screens/scenarios/scenarios-screen', () => ({ ScenariosScreen: () => null }))
vi.mock('../screens/reverse/reverse-screen', () => ({ ReverseScreen: () => null }))
vi.mock('../screens/benefits/benefits-screen', () => ({ BenefitsScreen: () => null }))
vi.mock('../screens/data/data-screen', () => ({ DataScreen: () => null }))

const today = new Date('2026-11-04')

/** Lets the hash change and the signal-driven render settle. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

beforeEach(() => {
  store.state.value = initialState({ today })
  location.hash = ''
  route.value = 'calc'
  toasts.value = []
  document.documentElement.removeAttribute('data-theme')
  document.documentElement.lang = 'cs'
})

afterEach(() => {
  cleanup()
  location.hash = ''
})

describe('App landmarks and navigation', () => {
  it('has a skip link to the main content and the page landmarks', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Přejít na obsah' }).getAttribute('href')).toBe('#main')
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Hlavní navigace' })).toBeTruthy()
    expect(screen.getByRole('main').id).toBe('main')
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('lists the screens in order, each with an icon and a hash link', () => {
    render(<App />)
    const links = within(screen.getByRole('navigation', { name: 'Hlavní navigace' })).getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '#/split',
      '#/calc',
      '#/costs',
      '#/scenarios',
      '#/reverse',
      '#/benefits',
      '#/data',
      '#/about',
    ])
    expect(links.every((link) => link.querySelector('svg[aria-hidden="true"]') !== null)).toBe(true)
  })

  it('marks the active screen with aria-current and follows the hash', async () => {
    render(<App />)
    expect(screen.getByRole('link', { name: 'Výpočet' }).getAttribute('aria-current')).toBe('page')

    location.hash = '#/costs'
    await waitFor(() => expect(screen.getByRole('link', { name: 'Náklady' }).getAttribute('aria-current')).toBe('page'))
    expect(screen.getByRole('link', { name: 'Výpočet' }).hasAttribute('aria-current')).toBe(false)
    await waitFor(() => expect(document.title).toBe('Náklady · OSVČ vs. zaměstnanec'))
  })

  it('opens the splitter by default once setup is complete', async () => {
    store.state.value = { ...initialState({ today }), hasCompletedSetup: true }
    location.hash = ''
    render(<App />)
    await waitFor(() => expect(screen.getByRole('link', { name: 'Rozdělit fakturu' }).getAttribute('aria-current')).toBe('page'))
  })
})

describe('App settings', () => {
  it('switches the language of the navigation and the page language', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'English' }))
    await waitFor(() => expect(screen.getByRole('link', { name: 'About' })).toBeTruthy())
    expect(screen.getByRole('button', { name: 'English' }).getAttribute('aria-pressed')).toBe('true')
    expect(document.documentElement.lang).toBe('en')
    expect(store.state.value.locale).toBe('en')

    fireEvent.click(screen.getByRole('button', { name: 'Čeština' }))
    await waitFor(() => expect(screen.getByRole('link', { name: 'O aplikaci' })).toBeTruthy())
    expect(document.documentElement.lang).toBe('cs')
  })

  it('sets the theme on the page and removes it for the system theme', async () => {
    render(<App />)
    const select = screen.getByRole('combobox', { name: 'Motiv' })
    fireEvent.change(select, { target: { value: 'dark' } })
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('dark'))
    expect(store.state.value.theme).toBe('dark')

    fireEvent.change(select, { target: { value: 'system' } })
    await waitFor(() => expect(document.documentElement.hasAttribute('data-theme')).toBe(false))
  })

  it('changes the active year from the header', async () => {
    render(<App />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Daňový rok' }), { target: { value: '2025' } })
    await waitFor(() => expect(store.state.value.activeYear).toBe(2025))
  })
})

describe('App year notice and footer', () => {
  it('shows the notice above a screen whose year has no values, and not on About', async () => {
    store.setActiveYear(2028)
    render(<App />)
    expect(screen.getByText('Hodnoty pro 2028 doplníme co nejdříve.')).toBeTruthy()

    location.hash = '#/about'
    await waitFor(() => expect(screen.queryByText('Hodnoty pro 2028 doplníme co nejdříve.')).toBeNull())
  })

  it('shows the disclaimer and the validity date of the active year in the footer', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText(/Odhad, ne daňové poradenství/)).toBeTruthy()
    expect(within(footer).getByText('Hodnoty platné od 1. 1. 2026')).toBeTruthy()
    expect(within(footer).getByRole('link', { name: /Tabulka 2026/ }).getAttribute('href')).toBe(
      'https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s',
    )
    expect(within(footer).getByRole('link', { name: /Nahlásit chybu/ }).getAttribute('href')).toBe(
      'https://github.com/benabraham/osvc-v-employee/issues',
    )
  })

  it('says when the current year has no values yet', () => {
    store.setActiveYear(2028)
    store.setActiveYear(2026)
    store.state.value = { ...store.state.value, customYearData: {} }
    render(<App />)
    expect(within(screen.getByRole('contentinfo')).queryByText(/Pro aktuální rok/)).toBeNull()
  })

  it('applies a shared link: the calculator opens with the confirmation', async () => {
    const { encodeSharedCalculation } = await import('../state/share')
    const token = encodeSharedCalculation({ year: 2025, inputs: { ...store.activeInputs.value, hourlyRate: 900 } })
    location.hash = `#/share/${token}`
    render(<App />)
    await waitFor(() => expect(screen.getByText('Načteno ze sdíleného odkazu')).toBeTruthy())
    expect(store.state.value.activeYear).toBe(2025)
    await waitFor(() => expect(location.hash).toBe('#/calc'))
    await settle()
  })
})
