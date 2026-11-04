import { describe, expect, it } from 'vitest'
import { TAX_YEARS, type TaxYearData } from '../../data/tax-years'
import { computeResults, defaultInputs } from '../../model'
import { defaultTargetNetMonthlyFor, reverseSearchFor } from './reverse-target'

const data2026 = TAX_YEARS[2026] as TaxYearData

describe('defaultTargetNetMonthlyFor', () => {
  it('rounds the current net monthly income up to the next thousand', () => {
    expect(defaultTargetNetMonthlyFor({ netMonthly: 38_412 })).toBe(39_000)
  })

  it('keeps an amount that is already a whole thousand', () => {
    expect(defaultTargetNetMonthlyFor({ netMonthly: 39_000 })).toBe(39_000)
  })

  it('gives zero when there is no net income to start from', () => {
    expect(defaultTargetNetMonthlyFor({ netMonthly: 0 })).toBe(0)
  })
})

describe('reverseSearchFor', () => {
  it('finds the smallest rate that shows the target: 649 Kč/h for 39 700 Kč a month with the 2026 defaults', () => {
    const search = reverseSearchFor({ targetNetMonthly: 39_700, inputs: defaultInputs(), data: data2026 })
    expect(search.isReachable).toBe(true)
    expect(search.hourlyRate).toBe(649)
  })

  it('returns the smallest rate: one crown less does not reach the target', () => {
    const inputs = defaultInputs()
    const { hourlyRate } = reverseSearchFor({ targetNetMonthly: 39_700, inputs, data: data2026 })
    const below = computeResults({ inputs: { ...inputs, hourlyRate: hourlyRate - 1 }, data: data2026 })
    const at = computeResults({ inputs: { ...inputs, hourlyRate }, data: data2026 })
    expect(below.plan.netMonthly).toBeLessThan(39_700)
    expect(at.plan.netMonthly).toBeGreaterThanOrEqual(39_700)
  })

  it('reports what the found rate leads to: invoiced per year, net monthly and gross equivalent', () => {
    const search = reverseSearchFor({ targetNetMonthly: 39_700, inputs: defaultInputs(), data: data2026 })
    const expected = computeResults({ inputs: { ...defaultInputs(), hourlyRate: search.hourlyRate }, data: data2026 })
    expect(search.invoiced).toBe(expected.plan.invoiced)
    expect(search.netMonthly).toBe(expected.plan.netMonthly)
    expect(search.grossEquivalent).toBe(expected.grossEquivalent.grossWage)
  })

  it('gives the difference against the current hourly rate', () => {
    const inputs = { ...defaultInputs(), hourlyRate: 800 }
    const search = reverseSearchFor({ targetNetMonthly: 39_700, inputs, data: data2026 })
    expect(search.currentHourlyRate).toBe(800)
    expect(search.difference).toBe(649 - 800)
  })

  it('says the target is unreachable when even the maximum searched rate falls short', () => {
    const search = reverseSearchFor({ targetNetMonthly: 10_000_000, inputs: defaultInputs(), data: data2026 })
    expect(search.isReachable).toBe(false)
  })

  it('finishes one search for the 2026 defaults in under 50 ms', () => {
    reverseSearchFor({ targetNetMonthly: 39_700, inputs: defaultInputs(), data: data2026 })
    const startedAt = performance.now()
    reverseSearchFor({ targetNetMonthly: 39_700, inputs: defaultInputs(), data: data2026 })
    expect(performance.now() - startedAt).toBeLessThan(50)
  })
})
