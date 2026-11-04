/**
 * Who qualifies for each benefit, for an employee and for an OSVČ with the same answers. The rules live in
 * src/calc/benefit-eligibility.ts; this function only puts the answers of the screen into them.
 */
import {
  isEligibleForMaternityBenefit,
  isEligibleForOsvcSicknessBenefit,
  isEligibleForPaternityBenefit,
  JOB_INSURED_MONTHS_AT_END,
} from '../../calc'

/** What the user answers about insurance history; the screen keeps these in local state. */
export type EligibilityAnswers = {
  /** days of sickness insurance in the two years before the benefit starts (§ 32 odst. 2) */
  insuredDaysInLastTwoYears: number
  /** days of OSVČ sickness insurance in the last year (§ 32 odst. 3) */
  osvcInsuredDaysInLastYear: number
  /** whole months of OSVČ sickness insurance right before the benefit (§ 24) */
  osvcInsuredMonths: number
  /** the OSVČ insurance started within 8 days after an insured job that lasted its last 3 months (§ 24) */
  continuesFromInsuredJob: boolean
}

/**
 * Whether the benefits are granted, and for an OSVČ which conditions are missing. An employee has no waiting period
 * for sickness, so that verdict is always positive.
 *
 * Legal references: § 24 and § 38a odst. 3 zákona 187/2006 Sb. (waiting period), § 32 odst. 2–3 (maternity).
 *
 * @param {object} params
 * @param {EligibilityAnswers} params.answers
 */
export const eligibilityVerdictsFor = ({ answers }: { answers: EligibilityAnswers }) => {
  const osvcWaitingPeriod = {
    osvcInsuredMonthsBefore: answers.osvcInsuredMonths,
    daysBetweenJobAndOsvcInsurance: answers.continuesFromInsuredJob ? 0 : undefined,
    employeeInsuredMonthsAtJobEnd: answers.continuesFromInsuredJob ? JOB_INSURED_MONTHS_AT_END : 0,
  }
  return {
    employee: {
      sickness: { isEligible: true, unmetConditions: [] as string[] },
      maternity: isEligibleForMaternityBenefit({ insuredDaysInLastTwoYears: answers.insuredDaysInLastTwoYears }),
      paternity: isEligibleForPaternityBenefit({ isOsvc: false }),
    },
    osvc: {
      sickness: isEligibleForOsvcSicknessBenefit(osvcWaitingPeriod),
      maternity: isEligibleForMaternityBenefit({
        insuredDaysInLastTwoYears: answers.insuredDaysInLastTwoYears,
        isOsvc: true,
        osvcInsuredDaysInLastYear: answers.osvcInsuredDaysInLastYear,
      }),
      paternity: isEligibleForPaternityBenefit({ isOsvc: true, ...osvcWaitingPeriod }),
    },
  }
}
