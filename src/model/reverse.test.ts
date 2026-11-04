import { describe, expect, it } from 'vitest'
import { TAX_YEARS } from '../data/tax-years'
import { computeResults } from './compute'
import { defaultInputs } from './inputs'
import { findHourlyRateForNetMonthly } from './reverse'

const data2026 = TAX_YEARS[2026]!

describe('findHourlyRateForNetMonthly', () => {
  it('finds the smallest whole-crown hourly rate that reaches 39 700 Kč net a month for 2026 defaults', () => {
    const result = findHourlyRateForNetMonthly({ targetNetMonthly: 39_700, inputs: defaultInputs(), data: data2026 })
    expect(result.isReachable).toBe(true)
    expect(result.hourlyRate).toBeLessThanOrEqual(650)
    expect(result.results.plan.netMonthly).toBeGreaterThanOrEqual(39_700)
    const below = computeResults({ inputs: { ...defaultInputs(), hourlyRate: result.hourlyRate - 1 }, data: data2026 })
    expect(below.plan.netMonthly).toBeLessThan(39_700)
  })

  it('reports the rate that the search ended at when the target is out of reach', () => {
    const result = findHourlyRateForNetMonthly({ targetNetMonthly: 100_000_000, inputs: defaultInputs(), data: data2026 })
    expect(result).toMatchObject({ hourlyRate: 20_000, isReachable: false })
  })

  it('ignores overrides of the levies and the costs during the search', () => {
    const overridden = findHourlyRateForNetMonthly({
      targetNetMonthly: 39_700,
      inputs: { ...defaultInputs(), overrides: { taxDeductibleCosts: 1, totalLevies: 1 } },
      data: data2026,
    })
    const plain = findHourlyRateForNetMonthly({ targetNetMonthly: 39_700, inputs: defaultInputs(), data: data2026 })
    expect(overridden.hourlyRate).toBe(plain.hourlyRate)
  })
})
