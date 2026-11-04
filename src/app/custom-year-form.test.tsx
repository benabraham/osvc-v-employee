// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TAX_YEARS } from '../data/tax-years'
import { initialState } from '../state/schema'
import { store } from './context'
import { CustomYearForm } from './custom-year-form'

const today = new Date('2026-11-04')

beforeEach(() => {
  store.state.value = initialState({ today })
})

afterEach(() => {
  cleanup()
})

describe('CustomYearForm', () => {
  it('is prefilled with the latest official values, with the social share as a percentage', () => {
    render(<CustomYearForm year={2026} onDone={() => {}} />)
    const form = screen.getByRole('form', { name: 'Vlastní hodnoty pro 2026' })
    expect((within(form).getByLabelText('Minimální mzda (měsíčně)') as HTMLInputElement).value.replace(/\s/g, '')).toBe('24900')
    expect((within(form).getByLabelText('Podíl průměrné mzdy pro minimální základ SP') as HTMLInputElement).value).toBe('35')
    expect((within(form).getByLabelText('Daňové zvýhodnění na 3. a další dítě (měsíčně)') as HTMLInputElement).value.replace(/\s/g, '')).toBe(
      '2320',
    )
  })

  it('saves the edited numbers, marks them custom and turns them on for the year', async () => {
    const onDone = vi.fn()
    render(<CustomYearForm year={2026} onDone={onDone} />)
    const form = screen.getByRole('form', { name: 'Vlastní hodnoty pro 2026' })
    fireEvent.input(within(form).getByLabelText('Minimální mzda (měsíčně)'), { target: { value: '23000' } })
    fireEvent.input(within(form).getByLabelText('Podíl průměrné mzdy pro minimální základ SP'), { target: { value: '40' } })
    fireEvent.click(within(form).getByRole('button', { name: 'Uložit a použít' }))

    expect(onDone).toHaveBeenCalledTimes(1)
    const saved = store.state.value.customYearData['2026']!
    expect(saved.minimumWage).toBe(23_000)
    expect(saved.socialMinimumShare).toBeCloseTo(0.4)
    expect(saved.status.minimumWage).toBe('custom')
    expect(saved.status.socialMinimumShare).toBe('custom')
    expect(saved.status.workingDays).toBeUndefined()
    expect(store.state.value.useCustomData['2026']).toBe(true)
    expect(store.isUsingCustomData.value).toBe(true)
  })

  it('keeps the official values in use when the user chooses them, without deleting the own numbers', () => {
    const onDone = vi.fn()
    store.setCustomYearData(2026, { ...TAX_YEARS[2026]!, averageWage: 50_000 })
    store.setUseCustomData(2026, true)
    render(<CustomYearForm year={2026} onDone={onDone} />)
    fireEvent.click(screen.getByRole('button', { name: 'Použít oficiální hodnoty' }))
    expect(store.state.value.useCustomData['2026']).toBe(false)
    expect(store.state.value.customYearData['2026']?.averageWage).toBe(50_000)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('offers no official values for a year without them, and cancels without saving', () => {
    const onDone = vi.fn()
    render(<CustomYearForm year={2028} onDone={onDone} />)
    expect(screen.queryByRole('button', { name: 'Použít oficiální hodnoty' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }))
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(store.state.value.customYearData['2028']).toBeUndefined()
  })
})
