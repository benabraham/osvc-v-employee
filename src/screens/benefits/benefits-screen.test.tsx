// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { store } from '../../app/context'
import { computeResults } from '../../model'
import { defaultInputs } from '../../model/inputs'
import { TAX_YEARS } from '../../data/tax-years'
import { formatMoney } from '../../i18n'
import { initialState } from '../../state'
import { BenefitsScreen } from './benefits-screen'
import { compareBenefits, HOURS_PER_WORKING_DAY, MATERNITY_WEEKS_SINGLE_BIRTH } from './compare-benefits'

const money = (value: number) => formatMoney(value, 'cs')

/** The text as getByText sees it: testing-library turns no-break spaces into plain spaces in the page, not in the query. */
const moneyLabel = (value: number) => money(value).replace(/\u00a0/g, ' ')

/** The calculation of the default inputs for 2026, the same numbers the screen starts from. */
const defaultResults = () => {
  const data = TAX_YEARS[2026]
  if (!data) throw new Error('no 2026 data')
  return computeResults({ inputs: defaultInputs(), data })
}

/** A row of the comparison table, found inside its own section so the names do not clash with the eligibility rows. */
const comparisonRow = (name: RegExp) => within(screen.getByRole('region', { name: 'Porovnání dávek' })).getByRole('row', { name })

/** A row of the eligibility table. */
const eligibilityRow = (name: RegExp) => within(screen.getByRole('region', { name: 'Nárok' })).getByRole('row', { name })

/** The text of each value cell of a row, in column order. */
const cellsOf = (row: HTMLElement) => within(row).getAllByRole('cell').map((cell) => cell.textContent ?? '')

beforeEach(() => {
  store.state.value = initialState({ today: new Date('2026-11-04') })
})

afterEach(() => {
  cleanup()
})

describe('BenefitsScreen', () => {
  it('explains that an employee is insured for sickness automatically and an OSVČ only voluntarily', () => {
    render(<BenefitsScreen />)
    expect(
      screen.getByText('Zaměstnanec je na nemocenské pojištěn automaticky. OSVČ ji má jen při dobrovolném nemocenském pojištění.'),
    ).toBeTruthy()
  })

  it('renders both columns with the sickness totals of the calculators for the default inputs', () => {
    render(<BenefitsScreen />)
    const results = defaultResults()
    const expected = compareBenefits({
      employeeMonthlyGross: results.grossEquivalent.grossWage,
      osvcMonthlySicknessPremium: 243,
      sicknessDays: 30,
      maternityWeeks: MATERNITY_WEEKS_SINGLE_BIRTH,
      workingHoursPerYear: results.workingDays * HOURS_PER_WORKING_DAY,
      rates: results.rates.benefits,
    })

    const comparison = within(screen.getByRole('region', { name: 'Porovnání dávek' }))
    expect(comparison.getByRole('columnheader', { name: 'Zaměstnanec' })).toBeTruthy()
    expect(comparison.getByRole('columnheader', { name: 'OSVČ' })).toBeTruthy()
    const [employeeTotal, osvcTotal] = cellsOf(comparisonRow(/Celkem za nemoc/))
    expect(employeeTotal).toBe(money(expected.employee.sicknessTotal))
    expect(osvcTotal).toBe(money(expected.osvc.sicknessTotal))
  })

  it('shows that the OSVČ sickness insurance is off, the minimum premium, and a link to turn it on', () => {
    render(<BenefitsScreen />)
    expect(screen.getByText('vypnuto')).toBeTruthy()
    expect(screen.getByText('Pojištění je vypnuté. Níže je minimální pojistné, jako kdybys platil(a) minimum.')).toBeTruthy()
    const link = screen.getByRole('link', { name: 'Zapnout ve výpočtu' })
    expect(link.getAttribute('href')).toBe('#/calc')
  })

  it('shows the premium and base of the calculation when the insurance is on', () => {
    store.setInput('sicknessInsurance', { enabled: true, monthlyAssessmentBase: 37_100 })
    render(<BenefitsScreen />)
    expect(screen.getByText('zapnuto')).toBeTruthy()
    expect(screen.getByText(moneyLabel(1_002))).toBeTruthy()
    expect(screen.getByText(moneyLabel(37_100))).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Zapnout ve výpočtu' })).toBeNull()
  })

  it('states the pension difference without calculating pensions', () => {
    render(<BenefitsScreen />)
    expect(screen.getByText('Důchod OSVČ bývá nižší než důchod zaměstnance. Aplikace důchody nepočítá.')).toBeTruthy()
  })

  it('gives the eligibility of an employee and an OSVČ for 2026 with the reasons in plain language', () => {
    render(<BenefitsScreen />)
    const sicknessCells = cellsOf(eligibilityRow(/^Nemocenská/))
    expect(sicknessCells[0]).toContain('Ano')
    expect(sicknessCells[1]).toContain('Ne')
    expect(sicknessCells[1]).toContain('Chybí čekací doba')

    const maternityCells = cellsOf(eligibilityRow(/^Mateřská/))
    expect(maternityCells[0]).toContain('Ano')
    expect(maternityCells[1]).toContain('Ne')
    expect(maternityCells[1]).toContain('Chybí dny OSVČ nemocenského: potřeba 180 za poslední rok.')

    const paternityCells = cellsOf(eligibilityRow(/^Otcovská/))
    expect(paternityCells[0]).toContain('Ano')
    expect(paternityCells[1]).toContain('Ne')
  })

  it('makes the OSVČ sickness benefit eligible once the insurance is on (prefilled 12 months)', () => {
    store.setInput('sicknessInsurance', { enabled: true, monthlyAssessmentBase: null })
    render(<BenefitsScreen />)
    const sicknessCells = cellsOf(eligibilityRow(/^Nemocenská/))
    expect(sicknessCells[1]).toContain('Ano')
    expect(sicknessCells[1]).not.toContain('Chybí')
  })

  it('makes the OSVČ sickness benefit eligible when the user came from an insured job', () => {
    render(<BenefitsScreen />)
    fireEvent.click(screen.getByRole('switch', { name: /Navazuji na zaměstnání/ }))
    const sicknessCells = cellsOf(eligibilityRow(/^Nemocenská/))
    expect(sicknessCells[1]).toContain('Ano')
  })

  it('refuses an employee maternity benefit when the insured days in two years are below 270', () => {
    render(<BenefitsScreen />)
    fireEvent.input(screen.getByLabelText('Dny pojištění za posledních 2 roky'), { target: { value: '200' } })
    const maternityCells = cellsOf(eligibilityRow(/^Mateřská/))
    expect(maternityCells[0]).toContain('Ne')
    expect(maternityCells[0]).toContain('Chybí dny pojištění: potřeba 270 za posledních 2 roky.')
  })

  it('switches the maternity weeks to 37 for a multiple birth', () => {
    render(<BenefitsScreen />)
    expect(comparisonRow(/Mateřská za 28 týdnů/)).toBeTruthy()
    fireEvent.click(screen.getByRole('switch', { name: 'Dvě nebo více dětí najednou (37 týdnů)' }))
    expect(comparisonRow(/Mateřská za 37 týdnů/)).toBeTruthy()
  })

  it('recalculates the OSVČ sickness total when the length of the sickness changes', () => {
    render(<BenefitsScreen />)
    fireEvent.input(screen.getByLabelText('Délka nemoci'), { target: { value: '45' } })
    const results = defaultResults()
    const expected = compareBenefits({
      employeeMonthlyGross: results.grossEquivalent.grossWage,
      osvcMonthlySicknessPremium: 243,
      sicknessDays: 45,
      maternityWeeks: MATERNITY_WEEKS_SINGLE_BIRTH,
      workingHoursPerYear: results.workingDays * HOURS_PER_WORKING_DAY,
      rates: results.rates.benefits,
    })
    const [, osvcTotal] = cellsOf(comparisonRow(/Celkem za nemoc/))
    expect(osvcTotal).toBe(money(expected.osvc.sicknessTotal))
  })

  it('prefills the inputs again when the active year changes', async () => {
    render(<BenefitsScreen />)
    fireEvent.input(screen.getByLabelText('Délka nemoci'), { target: { value: '45' } })
    store.setActiveYear(2025)
    await waitFor(() => expect((screen.getByLabelText('Délka nemoci') as HTMLInputElement).value).toBe('30'))
  })

  it('shows a notice instead of the comparison when the year has no data', () => {
    store.setActiveYear(2030)
    render(<BenefitsScreen />)
    expect(
      screen.getByText('Pro tento rok nejsou hodnoty, takže dávky nejde spočítat. Vyber rok s daty, nebo zadej vlastní hodnoty.'),
    ).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })
})
