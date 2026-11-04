// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { customYearDataFor } from '../data/tax-years'
import { initialState } from '../state/schema'
import { store } from './context'
import { YearSwitcher } from './year-switcher'

const today = new Date('2026-11-04')

beforeEach(() => {
  store.state.value = initialState({ today })
})

afterEach(() => {
  cleanup()
})

describe('YearSwitcher', () => {
  it('lists the four years of the window with their kind, and the active year is selected', () => {
    render(<YearSwitcher />)
    const select = screen.getByRole('combobox', { name: 'Daňový rok' }) as HTMLSelectElement
    const options = [...select.options].map((option) => option.textContent)
    expect(options).toEqual(['2024 · minulý rok', '2025 · minulý rok', '2026 · aktuální', '2027 · příští'])
    expect(select.value).toBe('2026')
  })

  it('changes the active year', () => {
    render(<YearSwitcher />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Daňový rok' }), { target: { value: '2024' } })
    expect(store.state.value.activeYear).toBe(2024)
  })

  it('shows the own-values badge when the active year runs on the user’s numbers', async () => {
    store.setCustomYearData(2026, customYearDataFor({ year: 2026 }))
    store.setUseCustomData(2026, true)
    render(<YearSwitcher />)
    expect(await screen.findByText('vlastní hodnoty')).toBeTruthy()
  })

  it('shows the unverified badge with the unverified values in its title', () => {
    store.setActiveYear(2027)
    render(<YearSwitcher />)
    const badge = screen.getByText('neověřeno')
    expect(badge.getAttribute('title')).toContain('Paušální daň, pásma')
  })

  it('shows no badge for a verified year on official values', () => {
    render(<YearSwitcher />)
    expect(screen.queryByText('neověřeno')).toBeNull()
    expect(screen.queryByText('vlastní hodnoty')).toBeNull()
  })
})
