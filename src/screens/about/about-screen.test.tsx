// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { customYearDataFor } from '../../data/tax-years'
import { store } from '../../app/context'
import { currentLocale } from '../../ui/locale'
import { initialState } from '../../state/schema'
import { AboutScreen } from './about-screen'

const today = new Date('2026-11-04')

beforeEach(() => {
  store.state.value = initialState({ today })
  currentLocale.value = 'cs'
})

afterEach(() => {
  cleanup()
  currentLocale.value = 'cs'
})

describe('AboutScreen', () => {
  it('explains what the app answers, how the calculation works and how the data is kept', () => {
    render(<AboutScreen />)
    expect(screen.getByRole('heading', { level: 1, name: 'O aplikaci' })).toBeTruthy()
    expect(screen.getByText('Jak rozdělit každou fakturu, kterou pošlu?')).toBeTruthy()
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(8)
    const steps = within(screen.getByRole('heading', { name: 'Jak výpočet funguje' }).closest('section')!).getAllByRole('listitem')
    expect(steps).toHaveLength(8)
    expect(screen.getByRole('heading', { name: 'Soukromí' })).toBeTruthy()
    expect(screen.getByText(/nemá server, účty ani sledování/)).toBeTruthy()
    expect(screen.getByText(/Odhad, ne daňové poradenství/)).toBeTruthy()
    expect(screen.getByText(/MIT licencí/)).toBeTruthy()
    expect(screen.getByText(/Dan Srb/)).toBeTruthy()
  })

  it('links the sources of the active year, grouped by value, with their status', () => {
    render(<AboutScreen />)
    expect(screen.getByRole('heading', { name: 'Zdroje hodnot pro 2026' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Průměrná mzda/ })).toBeTruthy()
    const incomeTaxLink = screen.getByRole('link', { name: /zákon 586\/1992 Sb\., o daních z příjmů/ })
    expect(incomeTaxLink.getAttribute('href')).toBe('https://www.zakonyprolidi.cz/cs/1992-586')
    expect(incomeTaxLink.getAttribute('target')).toBe('_blank')
    expect(incomeTaxLink.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('shows the status legend with the three states', () => {
    render(<AboutScreen />)
    const legend = screen.getByRole('heading', { name: 'Stavy hodnot' }).closest('section')!
    expect(within(legend).getByText('ověřeno')).toBeTruthy()
    expect(within(legend).getByText('z textu zákona')).toBeTruthy()
    expect(within(legend).getByText('vlastní')).toBeTruthy()
  })

  it('marks the sources of 2027 as derived from the act text', () => {
    store.setActiveYear(2027)
    render(<AboutScreen />)
    const group = screen.getByRole('heading', { name: /Paušální daň, pásma/ }).closest('section')!
    expect(within(group).getByText('z textu zákona')).toBeTruthy()
  })

  it('says there are no sources for a year without official values', () => {
    store.setActiveYear(2028)
    render(<AboutScreen />)
    expect(screen.getByRole('heading', { name: 'Zdroje hodnot pro 2028' })).toBeTruthy()
    expect(screen.getByText('Pro tento rok zatím nejsou oficiální hodnoty, a proto ani zdroje.')).toBeTruthy()
  })

  it('says the sources belong to the official values while the user’s own numbers are in use', () => {
    store.setCustomYearData(2026, customYearDataFor({ year: 2026 }))
    store.setUseCustomData(2026, true)
    render(<AboutScreen />)
    expect(screen.getByText(/Právě počítáte s vlastními hodnotami/)).toBeTruthy()
  })

  it('links the bug tracker, the author’s video and the sheet', () => {
    render(<AboutScreen />)
    expect(screen.getByRole('link', { name: /Nahlásit chybu/ }).getAttribute('href')).toBe('https://github.com/benabraham/osvc-v-employee/issues')
    expect(screen.getByRole('link', { name: /Původní video na YouTube/ }).getAttribute('href')).toBe(
      'https://www.youtube.com/watch?v=iJGjTFDYw9A',
    )
    expect(screen.getByRole('link', { name: /Tabulka OSVČ v. zaměstnanec 2026/ }).getAttribute('href')).toBe(
      'https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s',
    )
  })

  it('follows the language', async () => {
    render(<AboutScreen />)
    currentLocale.value = 'en'
    store.setLocale('en')
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeTruthy())
    expect(screen.getByRole('heading', { name: 'How the calculation works' })).toBeTruthy()
  })
})
