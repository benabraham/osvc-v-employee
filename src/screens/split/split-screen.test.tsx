// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../../app/context'
import { initialState } from '../../state/schema'
import { SplitScreen } from './split-screen'

const TODAY = new Date('2026-11-04')

/** Replaces the no-break spaces of Czech money so the assertions read as plain text. */
const plainText = (text: string | null | undefined) => (text ?? '').replace(/ /g, ' ')

/** The live region that holds the split figures. */
const liveRegion = () => document.querySelector<HTMLElement>('[aria-live="polite"]')

/** The amount field of the splitter. */
const amountInput = () => screen.getByLabelText('Částka faktury') as HTMLInputElement

/** Matches a button by its visible text, ignoring the no-break space in Czech money. */
const buttonNamed = (text: string) => ({ name: (name: string) => plainText(name) === text })

/** The figure shown next to one label of the split, e.g. "na rezervu". */
const valueNextTo = (label: string) => {
  const row = screen.getByText(label).closest('.result-row')
  return plainText(row?.querySelector('.money')?.textContent)
}

beforeEach(() => {
  store.state.value = { ...initialState({ today: TODAY }), hasCompletedSetup: true }
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('SplitScreen', () => {
  it('shows the split of 10 000 Kč for the 2026 defaults', () => {
    render(<SplitScreen />)

    expect(plainText(amountInput().value)).toBe('10 000')
    expect(valueNextTo('na daně, SP, ZP, NP')).toBe('1 600 Kč')
    expect(valueNextTo('na náklady')).toBe('700 Kč')
    expect(valueNextTo('na rezervu')).toBe('900 Kč')
    expect(valueNextTo('na dovolenou')).toBe('500 Kč')
    expect(valueNextTo('můžeš utratit')).toBe('6 300 Kč')
  })

  it('keeps the split in the polite live region and notes that the parts are rounded to hundreds', () => {
    render(<SplitScreen />)

    expect(liveRegion()?.textContent).toContain('můžeš utratit')
    expect(screen.getAllByText('zaokrouhleno na stovky')).toHaveLength(4)
  })

  it('recalculates the split when the invoice amount is typed', () => {
    render(<SplitScreen />)

    fireEvent.input(amountInput(), { target: { value: '20000' } })

    expect(store.activeInputs.value.invoiceAmount).toBe(20_000)
    expect(plainText(amountInput().value)).toBe('20 000')
    expect(valueNextTo('na daně, SP, ZP, NP')).toBe('3 200 Kč')
    expect(valueNextTo('na náklady')).toBe('1 400 Kč')
    expect(valueNextTo('na rezervu')).toBe('1 800 Kč')
    expect(valueNextTo('na dovolenou')).toBe('1 100 Kč')
    expect(valueNextTo('můžeš utratit')).toBe('12 500 Kč')
  })

  it('sets the amount from a quick-pick chip', () => {
    render(<SplitScreen />)

    fireEvent.click(screen.getByRole('button', buttonNamed('50 000 Kč')))

    expect(store.activeInputs.value.invoiceAmount).toBe(50_000)
    expect(plainText(amountInput().value)).toBe('50 000')
    expect(screen.getByRole('button', buttonNamed('50 000 Kč')).getAttribute('aria-pressed')).toBe('true')
  })

  it('offers the five quick-pick amounts', () => {
    render(<SplitScreen />)

    for (const amount of ['5 000 Kč', '10 000 Kč', '20 000 Kč', '50 000 Kč', '100 000 Kč']) {
      expect(screen.getByRole('button', buttonNamed(amount))).toBeTruthy()
    }
  })

  it('shows the context line with the hourly rate, year and net monthly income', () => {
    render(<SplitScreen />)

    const context = plainText(document.body.textContent)
    expect(context).toContain('Sazba 650 Kč/h, rok 2026, čistý příjem měsíčně')
  })

  it('links the explanation to the calculation screen', () => {
    render(<SplitScreen />)

    expect(screen.getByText('Pomůcka pro průběžné odlévání peněz z každé vystavené faktury podle nastavení ve výpočtu.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Upravit nastavení ve výpočtu' }).getAttribute('href')).toBe('#/calc')
  })

  it('puts the amount field first among the focusable controls', () => {
    render(<SplitScreen />)

    const focusable = document.querySelectorAll<HTMLElement>('input, button, a[href]')
    expect(focusable[0]).toBe(amountInput())
  })

  it('shows the first-run card until the user completes setup', () => {
    store.state.value = { ...initialState({ today: TODAY }), hasCompletedSetup: false }
    render(<SplitScreen />)

    expect(screen.getByText('Nastav si nejdřív výpočet')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Otevřít výpočet' }).getAttribute('href')).toBe('#/calc')
  })

  it('completes setup from the first-run card and hides the card afterwards', () => {
    store.state.value = { ...initialState({ today: TODAY }), hasCompletedSetup: false }
    render(<SplitScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Hotovo, otevírat rovnou rozdělení faktury' }))

    expect(store.state.value.hasCompletedSetup).toBe(true)
    expect(screen.queryByText('Nastav si nejdřív výpočet')).toBeNull()
  })

  it('does not show the first-run card once setup is complete', () => {
    render(<SplitScreen />)

    expect(screen.queryByText('Nastav si nejdřív výpočet')).toBeNull()
  })

  it('copies a plain-text summary and confirms it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<SplitScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Kopírovat rozdělení' }))

    await waitFor(() => expect(screen.getByText('Zkopírováno')).toBeTruthy())
    const copied = plainText(writeText.mock.calls[0]?.[0] as string)
    expect(copied).toContain('na daně, SP, ZP, NP: 1 600 Kč')
    expect(copied).toContain('můžeš utratit: 6 300 Kč')
  })

  it('shows a short line instead of the split when the year has no data', () => {
    store.state.value = { ...store.state.value, activeYear: 2099 }
    render(<SplitScreen />)

    expect(screen.getByText('Pro tento rok nejsou hodnoty pro výpočet.')).toBeTruthy()
    expect(screen.queryByText('můžeš utratit')).toBeNull()
  })
})
