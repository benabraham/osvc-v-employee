// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { store } from '../../app/context'
import { formatNumber } from '../../i18n'
import { TAX_YEARS, type TaxYearData } from '../../data/tax-years'
import { computeResults, defaultInputs } from '../../model'
import { initialState } from '../../state'
import { ReverseScreen } from './reverse-screen'

const data2026 = TAX_YEARS[2026] as TaxYearData
const netMonthlyAt = (hourlyRate: number) =>
  computeResults({ inputs: { ...defaultInputs(), hourlyRate }, data: data2026 }).plan.netMonthly

/** Testing Library gives the text of the field with the non-breaking spaces the app uses; normalise for matching. */
const plainText = (text: string | null | undefined) => (text ?? '').replace(/\s/g, ' ')

const targetField = () => screen.getByLabelText('Chci čistého měsíčně') as HTMLInputElement
const typeTarget = (value: string) => fireEvent.input(targetField(), { target: { value } })
/** The value next to a result label (the dd after its dt); the two are not separated by text in the DOM. */
const rowValue = (label: string) => plainText(screen.getByText(label).nextElementSibling?.textContent)
const liveRegion = () => screen.getByRole('heading', { name: 'Výsledek' }).parentElement?.querySelector('[aria-live]') as HTMLElement

beforeEach(() => {
  store.state.value = initialState({ today: new Date('2026-11-04') })
})

afterEach(() => {
  cleanup()
})

describe('ReverseScreen', () => {
  it('starts with the current net monthly income rounded up to the next thousand', () => {
    render(<ReverseScreen />)
    const expected = Math.ceil(netMonthlyAt(650) / 1000) * 1000
    expect(plainText(targetField().value)).toBe(plainText(formatNumber(expected, { locale: 'cs' })))
  })

  it('shows the hourly rate needed for the target and what it leads to', () => {
    render(<ReverseScreen />)
    typeTarget('39 700')
    const region = liveRegion()
    expect(region.getAttribute('aria-live')).toBe('polite')
    expect(plainText(region.textContent)).toContain('649 Kč/h')
    expect(plainText(region.textContent)).toContain('Fakturace za rok')
    expect(plainText(region.textContent)).toContain('Čistý příjem měsíčně')
    expect(plainText(region.textContent)).toContain('Hrubý ekvivalent měsíčně')
  })

  it('explains that the other settings come from the calculation', () => {
    render(<ReverseScreen />)
    expect(screen.getByText('Ostatní nastavení (dny, hodiny, náklady, slevy) se bere z výpočtu.')).toBeTruthy()
  })

  it('compares the current rate with the needed one', () => {
    store.state.value = { ...store.state.value, sharedInputs: { ...defaultInputs(), hourlyRate: 800 }, syncInputs: true }
    render(<ReverseScreen />)
    typeTarget('39 700')
    expect(rowValue('Aktuální sazba')).toBe('800 Kč/h')
    expect(rowValue('Rozdíl oproti aktuální sazbě')).toBe('−151 Kč/h')
  })

  it('says so when the target cannot be reached and disables the apply button', () => {
    render(<ReverseScreen />)
    typeTarget('10 000 000')
    expect(liveRegion().textContent).toContain('Ani sazba')
    expect(screen.getByRole('button', { name: 'Použít tuto sazbu' }).hasAttribute('disabled')).toBe(true)
  })

  it('applies the needed rate to the calculation and links to it', () => {
    store.state.value = { ...store.state.value, sharedInputs: { ...defaultInputs(), hourlyRate: 800 }, syncInputs: true }
    render(<ReverseScreen />)
    typeTarget('39 700')
    expect(screen.queryByText('Sazba je nastavena ve výpočtu.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Použít tuto sazbu' }))
    expect(store.activeInputs.value.hourlyRate).toBe(649)
    expect(screen.getByText('Sazba je nastavena ve výpočtu.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Otevřít výpočet' }).getAttribute('href')).toBe('#/calc')
  })

  it('says there are no values when the active year has no data', () => {
    store.state.value = { ...initialState({ today: new Date('2026-11-04') }), activeYear: 2030 }
    render(<ReverseScreen />)
    expect(screen.getByText('Pro rok 2030 zatím nejsou hodnoty, takže sazbu nelze spočítat.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Použít tuto sazbu' }).hasAttribute('disabled')).toBe(true)
  })
})
