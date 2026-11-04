import { describe, expect, it } from 'vitest'
import {
  isEligibleForMaternityBenefit,
  isEligibleForOsvcSicknessBenefit,
  isEligibleForPaternityBenefit,
} from './benefit-eligibility'

describe('maternity benefit eligibility (zákon 187/2006 Sb. § 32 odst. 2 a 3)', () => {
  it('needs 270 days of insurance in the last two years', () => {
    expect(isEligibleForMaternityBenefit({ insuredDaysInLastTwoYears: 270 }).isEligible).toBe(true)
    expect(isEligibleForMaternityBenefit({ insuredDaysInLastTwoYears: 269 })).toEqual({
      isEligible: false,
      unmetConditions: ['insuredDaysInLastTwoYears'],
    })
  })

  it('also needs 180 days of OSVČ sickness insurance in the last year for an OSVČ', () => {
    expect(
      isEligibleForMaternityBenefit({ insuredDaysInLastTwoYears: 400, isOsvc: true, osvcInsuredDaysInLastYear: 180 })
        .isEligible,
    ).toBe(true)
    expect(
      isEligibleForMaternityBenefit({ insuredDaysInLastTwoYears: 400, isOsvc: true, osvcInsuredDaysInLastYear: 179 }),
    ).toEqual({ isEligible: false, unmetConditions: ['osvcInsuredDaysInLastYear'] })
  })
})

describe('OSVČ sickness and paternity benefit eligibility (§ 24, § 38a odst. 3)', () => {
  it('needs 3 months of OSVČ sickness insurance right before', () => {
    expect(isEligibleForOsvcSicknessBenefit({ osvcInsuredMonthsBefore: 3 }).isEligible).toBe(true)
    expect(isEligibleForOsvcSicknessBenefit({ osvcInsuredMonthsBefore: 2 }).isEligible).toBe(false)
  })

  it('waives the 3 months after a job insured for its last 3 months, when OSVČ insurance began within 8 days', () => {
    const fromJob = { osvcInsuredMonthsBefore: 1, daysBetweenJobAndOsvcInsurance: 8, employeeInsuredMonthsAtJobEnd: 3 }
    expect(isEligibleForOsvcSicknessBenefit(fromJob).isEligible).toBe(true)
    expect(isEligibleForOsvcSicknessBenefit({ ...fromJob, daysBetweenJobAndOsvcInsurance: 9 }).isEligible).toBe(false)
    expect(isEligibleForOsvcSicknessBenefit({ ...fromJob, employeeInsuredMonthsAtJobEnd: 2 }).isEligible).toBe(false)
  })

  it('applies the same 3 months to OSVČ paternity benefit; insured employees qualify', () => {
    expect(isEligibleForPaternityBenefit({ isOsvc: true, osvcInsuredMonthsBefore: 2 }).isEligible).toBe(false)
    expect(isEligibleForPaternityBenefit({ isOsvc: true, osvcInsuredMonthsBefore: 3 }).isEligible).toBe(true)
    expect(isEligibleForPaternityBenefit({ isOsvc: false }).isEligible).toBe(true)
  })
})
