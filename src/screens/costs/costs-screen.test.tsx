// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { store } from '../../app/context'
import { initialState } from '../../state/schema'
import { CostsScreen } from './costs-screen'

const TODAY = new Date('2026-11-04')

/** Replaces the no-break spaces of Czech money so the assertions read as plain text. */
const plainText = (text: string | null | undefined) => (text ?? '').replace(/ /g, ' ')

/** The name inputs, one per row, in list order. */
const nameInputs = () => screen.getAllByLabelText('Název') as HTMLInputElement[]

/** The price inputs, one per row, in list order. */
const priceInputs = () => screen.getAllByLabelText('Cena') as HTMLInputElement[]

/** The yearly amounts shown in the rows, in list order. */
const yearlyAmounts = () => Array.from(document.querySelectorAll('.cost-yearly-value'), (element) => plainText(element.textContent))

/** The total per year, read from the polite live region. */
const totalText = () => plainText(document.querySelector('[aria-live="polite"]')?.textContent)

beforeEach(() => {
  store.state.value = { ...initialState({ today: TODAY }), hasCompletedSetup: true }
})

afterEach(() => {
  cleanup()
})

describe('CostsScreen', () => {
  it('lists the four default costs with their yearly amounts and the total', () => {
    render(<CostsScreen />)

    expect(nameInputs().map((input) => input.value)).toEqual(['hardware', 'software', 'účetní', 'vzdělávání (knihy, konference)'])
    expect(yearlyAmounts()).toEqual(['20 000 Kč', '12 000 Kč', '5 000 Kč', '10 000 Kč'])
    expect(totalText()).toContain('47 000 Kč')
  })

  it('shows the share of invoiced income that the costs take', () => {
    render(<CostsScreen />)

    expect(totalText()).toContain('6,8 %')
  })

  it('adds an empty row and focuses its name input', () => {
    render(<CostsScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Přidat náklad' }))

    expect(nameInputs()).toHaveLength(5)
    expect(document.activeElement).toBe(nameInputs()[4])
    expect(store.activeInputs.value.costs).toHaveLength(5)
    expect(totalText()).toContain('47 000 Kč')
  })

  it('updates the yearly amount and the total when a price changes', () => {
    render(<CostsScreen />)

    fireEvent.input(priceInputs()[0] as HTMLElement, { target: { value: '120000' } })

    expect(yearlyAmounts()[0]).toBe('40 000 Kč')
    expect(totalText()).toContain('67 000 Kč')
  })

  it('updates the yearly amount when the months of amortisation change', () => {
    render(<CostsScreen />)

    const monthsInputs = screen.getAllByLabelText('Na kolik měsíců') as HTMLInputElement[]
    fireEvent.input(monthsInputs[0] as HTMLElement, { target: { value: '12' } })

    expect(yearlyAmounts()[0]).toBe('60 000 Kč')
    expect(totalText()).toContain('87 000 Kč')
  })

  it('renames a row', () => {
    render(<CostsScreen />)

    fireEvent.input(nameInputs()[1] as HTMLElement, { target: { value: 'licence' } })

    expect(screen.getByRole('button', { name: 'Smazat licence' })).toBeTruthy()
  })

  it('deletes a row and offers to undo it, restoring it in its place', () => {
    render(<CostsScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Smazat hardware' }))

    expect(nameInputs().map((input) => input.value)).not.toContain('hardware')
    expect(totalText()).toContain('27 000 Kč')

    fireEvent.click(screen.getByRole('button', { name: 'Zpět' }))

    expect(nameInputs().map((input) => input.value)).toEqual(['hardware', 'software', 'účetní', 'vzdělávání (knihy, konference)'])
    expect(totalText()).toContain('47 000 Kč')
    expect(document.querySelector('[role="status"]')?.textContent).toBe('Vráceno')
  })

  it('labels every delete button with the row name', () => {
    render(<CostsScreen />)

    expect(screen.getByRole('button', { name: 'Smazat software' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Smazat účetní' })).toBeTruthy()
  })

  it('shows the help text under the title', () => {
    render(<CostsScreen />)

    expect(screen.getByText('Skutečné náklady, které platíš z peněz po zdanění: hardware rozpočítej na dobu, kdy ho budeš používat.')).toBeTruthy()
  })

  it('shows only the total when the year has no data', () => {
    store.state.value = { ...store.state.value, activeYear: 2099 }
    render(<CostsScreen />)

    expect(totalText()).toContain('47 000 Kč')
    expect(totalText()).not.toContain('%')
  })
})
