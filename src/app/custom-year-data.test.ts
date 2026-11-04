import { describe, expect, it } from 'vitest'
import { TAX_YEARS, customYearDataFor } from '../data/tax-years'
import { changedStatusKeysFor, customYearDataFrom, draftFor } from './custom-year-data'

const prefill = customYearDataFor({ year: 2028 })

describe('draftFor', () => {
  it('reads the form fields from the year data, with the share as a percentage', () => {
    const draft = draftFor({ data: TAX_YEARS[2026]! })
    expect(draft).toEqual({
      averageWage: 48_967,
      minimumWage: 22_400,
      workingDays: 250,
      pausalniBand1: 9_162,
      pausalniBand2: 16_745,
      socialMinimumSharePercent: 35,
      payerCredit: 30_840,
      childCreditFirst: 1_267,
      childCreditSecond: 1_860,
      childCreditThirdAndMore: 2_320,
    })
  })
})

describe('changedStatusKeysFor', () => {
  it('names the value groups whose fields changed', () => {
    const base = draftFor({ data: prefill })
    const edited = { ...base, payerCredit: 31_000, childCreditSecond: 1_900 }
    expect(changedStatusKeysFor({ base, draft: edited })).toEqual(['incomeTax'])
    expect(changedStatusKeysFor({ base, draft: { ...base, averageWage: 50_000, socialMinimumSharePercent: 40 } })).toEqual([
      'averageWage',
      'socialMinimumShare',
    ])
    expect(changedStatusKeysFor({ base, draft: base })).toEqual([])
  })
})

describe('customYearDataFrom', () => {
  it('writes the edited numbers and keeps the rest of the year data', () => {
    const base = draftFor({ data: prefill })
    const data = customYearDataFrom({
      base: prefill,
      draft: { ...base, averageWage: 50_000, socialMinimumSharePercent: 40, pausalniBand1: 10_000, childCreditFirst: 1_500 },
    })
    expect(data.year).toBe(2028)
    expect(data.averageWage).toBe(50_000)
    expect(data.socialMinimumShare).toBe(0.4)
    expect(data.pausalniDanMonthly).toEqual([10_000, prefill.pausalniDanMonthly[1], prefill.pausalniDanMonthly[2]])
    expect(data.incomeTax.childCreditsMonthly).toEqual({ first: 1_500, second: prefill.incomeTax.childCreditsMonthly.second, thirdAndMore: prefill.incomeTax.childCreditsMonthly.thirdAndMore })
    expect(data.incomeTax.payerCredit).toBe(prefill.incomeTax.payerCredit)
    expect(data.reductionThresholds).toEqual(prefill.reductionThresholds)
  })

  it('marks the edited values as custom and keeps the status of the others', () => {
    const base = draftFor({ data: prefill })
    const data = customYearDataFrom({ base: prefill, draft: { ...base, minimumWage: 25_000 } })
    expect(data.status.minimumWage).toBe('custom')
    expect(data.status.averageWage).toBe('custom')
    expect(data.status.workingDays).toBeUndefined()
  })

  it('keeps the percentage share exact when the form is unchanged', () => {
    const data = customYearDataFrom({ base: TAX_YEARS[2026]!, draft: draftFor({ data: TAX_YEARS[2026]! }) })
    expect(data.socialMinimumShare).toBe(TAX_YEARS[2026]!.socialMinimumShare)
  })
})
