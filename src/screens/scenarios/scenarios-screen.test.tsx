// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { store } from '../../app/context'
import { TAX_YEARS, type TaxYearData } from '../../data/tax-years'
import { computeResults, defaultInputs } from '../../model'
import { formatMoney } from '../../i18n'
import { initialState, type Scenario } from '../../state'
import { ScenariosScreen } from './scenarios-screen'

const data2026 = TAX_YEARS[2026] as TaxYearData
const netMonthlyAt = (hourlyRate: number) =>
  computeResults({ inputs: { ...defaultInputs(), hourlyRate }, data: data2026 }).plan.netMonthly

const scenarioAt = ({ id, name, hourlyRate, year = 2026 }: { id: string; name: string; hourlyRate: number; year?: number }): Scenario => ({
  id,
  name,
  year,
  inputs: { ...defaultInputs(), hourlyRate },
  createdAt: '2026-11-04T10:00:00.000Z',
})

const withScenarios = (scenarios: Scenario[], overrides: Partial<ReturnType<typeof initialState>> = {}) => {
  store.state.value = { ...initialState({ today: new Date('2026-11-04') }), scenarios, ...overrides }
}

const comparisonTable = () => screen.getByRole('table', { name: 'Porovnání scénářů a aktuálního výpočtu' })

beforeEach(() => {
  withScenarios([])
  window.location.hash = ''
})

afterEach(() => {
  cleanup()
})

describe('ScenariosScreen: empty state', () => {
  it('explains what scenarios are for when none are saved', () => {
    render(<ScenariosScreen />)
    expect(screen.getByText('Zatím žádné scénáře')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })
})

describe('ScenariosScreen: saving', () => {
  it('suggests a name from the rate and the year, and saves the current calculation under it', () => {
    render(<ScenariosScreen />)
    const nameField = screen.getByLabelText('Název scénáře') as HTMLInputElement
    expect(nameField.value).toBe('650 Kč/h, 2026')

    fireEvent.click(screen.getByRole('button', { name: 'Uložit scénář' }))

    expect(store.state.value.scenarios).toHaveLength(1)
    expect(store.state.value.scenarios[0]?.name).toBe('650 Kč/h, 2026')
    expect(store.state.value.scenarios[0]?.inputs.hourlyRate).toBe(650)
    expect(screen.getByText('Scénář „650 Kč/h, 2026“ je uložen.')).toBeTruthy()
  })

  it('saves under the name the user typed', () => {
    render(<ScenariosScreen />)
    fireEvent.input(screen.getByLabelText('Název scénáře'), { target: { value: 'Freelance naplno' } })
    fireEvent.click(screen.getByRole('button', { name: 'Uložit scénář' }))
    expect(store.state.value.scenarios[0]?.name).toBe('Freelance naplno')
  })

  it('does not save a blank name', () => {
    render(<ScenariosScreen />)
    fireEvent.input(screen.getByLabelText('Název scénáře'), { target: { value: '   ' } })
    expect((screen.getByRole('button', { name: 'Uložit scénář' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('ScenariosScreen: managing saved scenarios', () => {
  it('renames a scenario from its name field', () => {
    withScenarios([scenarioAt({ id: 'a', name: '650', hourlyRate: 650 })])
    render(<ScenariosScreen />)
    fireEvent.change(screen.getByLabelText('Přejmenovat scénář „650“'), { target: { value: 'Nízká sazba' } })
    expect(store.state.value.scenarios[0]?.name).toBe('Nízká sazba')
  })

  it('does not rename a scenario to a blank name', () => {
    withScenarios([scenarioAt({ id: 'a', name: '650', hourlyRate: 650 })])
    render(<ScenariosScreen />)
    const field = screen.getByLabelText('Přejmenovat scénář „650“') as HTMLInputElement
    fireEvent.change(field, { target: { value: '  ' } })
    expect(store.state.value.scenarios[0]?.name).toBe('650')
    expect(field.value).toBe('650')
  })

  it('deletes a scenario with its labelled button', () => {
    withScenarios([scenarioAt({ id: 'a', name: '650', hourlyRate: 650 }), scenarioAt({ id: 'b', name: '800', hourlyRate: 800 })])
    render(<ScenariosScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Smazat scénář „650“' }))
    expect(store.state.value.scenarios.map((scenario) => scenario.id)).toEqual(['b'])
  })

  it('loads a scenario into the calculation and opens it', () => {
    withScenarios([scenarioAt({ id: 'a', name: '800', hourlyRate: 800 })])
    render(<ScenariosScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Načíst scénář „800“' }))
    expect(store.activeInputs.value.hourlyRate).toBe(800)
    expect(window.location.hash).toBe('#/calc')
  })
})

describe('ScenariosScreen: comparison', () => {
  beforeEach(() => {
    withScenarios([scenarioAt({ id: 'a', name: '650 Kč/h', hourlyRate: 650 }), scenarioAt({ id: 'b', name: '800 Kč/h', hourlyRate: 800 })])
  })

  it('shows one column per scenario with the current calculation first', () => {
    render(<ScenariosScreen />)
    const headers = within(comparisonTable())
      .getAllByRole('columnheader')
      .map((header) => header.textContent)
    expect(headers).toEqual(['Údaj', 'Aktuální výpočet', '650 Kč/h', '800 Kč/h'])
  })

  it('shows the net monthly income of both scenarios, with the higher one marked as the best', () => {
    render(<ScenariosScreen />)
    const table = within(comparisonTable())
    const netRow = table.getByRole('rowheader', { name: 'Čistý příjem měsíčně' }).closest('tr') as HTMLElement
    const cells = within(netRow).getAllByRole('cell')
    expect(cells[1]?.textContent).toContain(formatMoney(netMonthlyAt(650), 'cs'))
    expect(cells[2]?.textContent).toContain(formatMoney(netMonthlyAt(800), 'cs'))
    expect(netMonthlyAt(800)).toBeGreaterThan(netMonthlyAt(650))
    expect(cells[2]?.textContent).toContain('nejvyšší čistý příjem')
    expect(cells[1]?.textContent).not.toContain('nejvyšší čistý příjem')
  })

  it('offers the same comparison as swipeable cards, in a focusable region', () => {
    render(<ScenariosScreen />)
    const region = screen.getByRole('region', { name: 'Porovnání scénářů, posouvejte šipkami nebo přejetím' })
    expect(region.getAttribute('tabindex')).toBe('0')
    expect(within(region).getAllByRole('listitem')).toHaveLength(3)
  })

  it('flags a scenario whose year has no data instead of failing', () => {
    withScenarios([scenarioAt({ id: 'old', name: 'Starý', hourlyRate: 650, year: 2030 })])
    render(<ScenariosScreen />)
    expect(screen.getAllByText('Pro rok 2030 nejsou hodnoty, scénář se nepočítá.').length).toBeGreaterThan(0)
  })
})
