import { describe, expect, it } from 'vitest'
import { TAX_YEARS } from '../data/tax-years'
import { computeResults } from './compute'
import { defaultInputs } from './inputs'
import { yearOnYearChangeFor } from './year-change'

describe('yearOnYearChangeFor', () => {
  const inputs = defaultInputs()

  it('gives the net monthly income of the previous year and the difference for the same inputs', () => {
    const change = yearOnYearChangeFor({ inputs, data: TAX_YEARS[2026]!, previousData: TAX_YEARS[2025] })
    const currentNet = computeResults({ inputs, data: TAX_YEARS[2026]! }).plan.netMonthly
    const previousNet = computeResults({ inputs, data: TAX_YEARS[2025]! }).plan.netMonthly
    expect(change).toEqual({ previousNetMonthly: previousNet, difference: currentNet - previousNet })
  })

  it('gives null when there is no previous year to compare with', () => {
    expect(yearOnYearChangeFor({ inputs, data: TAX_YEARS[2026]!, previousData: undefined })).toBeNull()
  })
})
