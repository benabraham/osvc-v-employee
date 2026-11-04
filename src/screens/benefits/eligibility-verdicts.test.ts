import { describe, expect, it } from 'vitest'
import { eligibilityVerdictsFor, type EligibilityAnswers } from './eligibility-verdicts'

const withoutInsurance: EligibilityAnswers = {
  insuredDaysInLastTwoYears: 730,
  osvcInsuredDaysInLastYear: 0,
  osvcInsuredMonths: 0,
  continuesFromInsuredJob: false,
}

const withInsurance: EligibilityAnswers = {
  insuredDaysInLastTwoYears: 730,
  osvcInsuredDaysInLastYear: 365,
  osvcInsuredMonths: 12,
  continuesFromInsuredJob: false,
}

describe('eligibilityVerdictsFor', () => {
  it('gives an employee sickness and paternity benefit without a waiting period (§ 24 and § 38a odst. 3 apply to OSVČ only)', () => {
    const verdicts = eligibilityVerdictsFor({ answers: withoutInsurance })
    expect(verdicts.employee.sickness.isEligible).toBe(true)
    expect(verdicts.employee.paternity.isEligible).toBe(true)
  })

  it('gives an employee maternity benefit when there are 270 insured days in two years (§ 32 odst. 2)', () => {
    expect(eligibilityVerdictsFor({ answers: withoutInsurance }).employee.maternity.isEligible).toBe(true)
    const short = eligibilityVerdictsFor({ answers: { ...withoutInsurance, insuredDaysInLastTwoYears: 269 } })
    expect(short.employee.maternity).toEqual({ isEligible: false, unmetConditions: ['insuredDaysInLastTwoYears'] })
  })

  it('refuses an OSVČ sickness benefit without 3 months of OSVČ insurance (§ 24)', () => {
    const verdicts = eligibilityVerdictsFor({ answers: withoutInsurance })
    expect(verdicts.osvc.sickness).toEqual({ isEligible: false, unmetConditions: ['osvcWaitingPeriod'] })
  })

  it('gives an OSVČ sickness benefit after 3 months of OSVČ insurance', () => {
    const verdicts = eligibilityVerdictsFor({ answers: { ...withInsurance, osvcInsuredMonths: 3 } })
    expect(verdicts.osvc.sickness.isEligible).toBe(true)
  })

  it('gives an OSVČ sickness benefit without the waiting period when the insurance continues from an insured job (§ 24)', () => {
    const verdicts = eligibilityVerdictsFor({
      answers: { ...withoutInsurance, continuesFromInsuredJob: true },
    })
    expect(verdicts.osvc.sickness.isEligible).toBe(true)
    expect(verdicts.osvc.paternity.isEligible).toBe(true)
  })

  it('refuses an OSVČ maternity benefit without 180 days of OSVČ insurance in the last year (§ 32 odst. 3)', () => {
    const verdicts = eligibilityVerdictsFor({ answers: { ...withInsurance, osvcInsuredDaysInLastYear: 179 } })
    expect(verdicts.osvc.maternity).toEqual({ isEligible: false, unmetConditions: ['osvcInsuredDaysInLastYear'] })
  })

  it('lists both missing conditions of an OSVČ maternity benefit', () => {
    const verdicts = eligibilityVerdictsFor({
      answers: { ...withoutInsurance, insuredDaysInLastTwoYears: 100 },
    })
    expect(verdicts.osvc.maternity.unmetConditions).toEqual(['insuredDaysInLastTwoYears', 'osvcInsuredDaysInLastYear'])
  })

  it('gives an OSVČ maternity benefit with 270 insured days and 180 days of OSVČ insurance', () => {
    const verdicts = eligibilityVerdictsFor({ answers: { ...withInsurance, osvcInsuredDaysInLastYear: 180 } })
    expect(verdicts.osvc.maternity.isEligible).toBe(true)
  })

  it('needs the 3-month waiting period for an OSVČ paternity benefit', () => {
    const verdicts = eligibilityVerdictsFor({ answers: { ...withInsurance, osvcInsuredMonths: 2 } })
    expect(verdicts.osvc.paternity).toEqual({ isEligible: false, unmetConditions: ['osvcWaitingPeriod'] })
  })
})
