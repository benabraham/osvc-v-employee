// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TAX_YEARS } from '../data/tax-years'
import { initialState } from '../state/schema'
import { store } from './context'
import { YearDataNotice } from './year-data-notice'

const today = new Date('2026-11-04')

beforeEach(() => {
  store.state.value = initialState({ today })
})

afterEach(() => {
  cleanup()
})

describe('YearDataNotice for a year without values', () => {
  it('says the values are coming and offers to wait or to enter own figures', () => {
    store.setActiveYear(2028)
    render(<YearDataNotice />)
    expect(screen.getByText('Hodnoty pro 2028 doplníme co nejdříve.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Počkám' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Zadat vlastní čísla' })).toBeTruthy()
  })

  it('switches to the current year on "Počkám"', async () => {
    store.setActiveYear(2028)
    render(<YearDataNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Počkám' }))
    await waitFor(() => expect(store.state.value.activeYear).toBe(2026))
  })

  it('opens the form prefilled from the latest official year, and saves own numbers for the year', async () => {
    store.setActiveYear(2028)
    render(<YearDataNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Zadat vlastní čísla' }))

    const form = screen.getByRole('form', { name: 'Vlastní hodnoty pro 2028' })
    const averageWage = within(form).getByLabelText('Průměrná mzda') as HTMLInputElement
    expect(averageWage.value.replace(/\s/g, '')).toBe(String(TAX_YEARS[2027]!.averageWage))

    fireEvent.input(averageWage, { target: { value: '55000' } })
    fireEvent.click(within(form).getByRole('button', { name: 'Uložit a použít' }))

    await waitFor(() => expect(store.state.value.useCustomData['2028']).toBe(true))
    expect(store.state.value.customYearData['2028']?.averageWage).toBe(55_000)
    expect(store.state.value.customYearData['2028']?.status.averageWage).toBe('custom')
    expect(screen.getByText('Počítáte s vlastními hodnotami pro 2028. Oficiální hodnoty doplníme co nejdříve.')).toBeTruthy()
  })
})

describe('YearDataNotice when official values arrive for a year with own numbers', () => {
  beforeEach(() => {
    store.setActiveYear(2026)
    store.setCustomYearData(2026, { ...TAX_YEARS[2026]!, year: 2026, averageWage: 50_000 })
    store.setUseCustomData(2026, true)
  })

  it('asks once whether to switch to the official values', async () => {
    render(<YearDataNotice />)
    expect(screen.getByText('Oficiální hodnoty pro 2026 jsou k dispozici. Přepnout na ně?')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Ne, nechat vlastní' }))
    await waitFor(() => expect(screen.queryByText(/Oficiální hodnoty pro 2026/)).toBeNull())
    expect(store.state.value.officialDataPromptAnswered['2026']).toBe(true)
    expect(store.state.value.useCustomData['2026']).toBe(true)
  })

  it('switches to the official values on "Ano, přepnout"', async () => {
    render(<YearDataNotice />)
    fireEvent.click(screen.getByRole('button', { name: 'Ano, přepnout' }))
    await waitFor(() => expect(store.state.value.useCustomData['2026']).toBe(false))
    expect(store.isUsingCustomData.value).toBe(false)
  })
})

describe('YearDataNotice for a year with official values and no custom numbers', () => {
  it('shows nothing', () => {
    const { container } = render(<YearDataNotice />)
    expect(container.textContent).toBe('')
  })
})
