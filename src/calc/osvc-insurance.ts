import { floorDivide, roundHalfAwayFromZero } from './rounding'

/** ZP: 13.5 % of the assessment base. */
export const HEALTH_PREMIUM_RATE = 0.135
/** ZP: the assessment base is half of the profit. */
export const HEALTH_PROFIT_SHARE = 0.5
/** SP: 29.2 % of the assessment base (pension 28 % + sickness-free part). */
export const SOCIAL_PREMIUM_RATE = 0.292

/**
 * Yearly OSVČ health insurance (zdravotní pojištění) for main activity.
 *
 * @param {object} params
 * @param {number} params.income yearly income (příjmy)
 * @param {number} params.expenses yearly tax-deductible expenses (výdaje)
 * @param {{ minimumAssessmentBase: number }} params.rates minimum yearly assessment base
 * @returns {{ profit: number, calculatedAssessmentBase: number, assessmentBase: number, premium: number }}
 */
export const calculateOsvcHealthInsurance = ({
  income,
  expenses,
  rates,
}: {
  income: number
  expenses: number
  rates: { minimumAssessmentBase: number }
}) => {
  const profit = income - expenses
  const calculatedAssessmentBase = Math.ceil(profit * HEALTH_PROFIT_SHARE)
  const assessmentBase = Math.max(rates.minimumAssessmentBase, calculatedAssessmentBase)
  // the 8-digit rounding strips float noise before rounding up to whole crowns
  const premium = Math.ceil(roundHalfAwayFromZero(assessmentBase * HEALTH_PREMIUM_RATE, 8))
  return { profit, calculatedAssessmentBase, assessmentBase, premium }
}

/**
 * Yearly OSVČ social insurance (sociální pojištění, důchodové) for main activity.
 *
 * @param {object} params
 * @param {number} params.income yearly income
 * @param {number} params.expenses yearly tax-deductible expenses
 * @param {{ profitShare: number, minimumAssessmentBase: number, maximumAssessmentBase: number }} params.rates
 *   profitShare is 0.5 until 2023 and 0.55 from 2024; the maximum base is 48 × the average wage
 * @returns {{ profit: number, calculatedAssessmentBase: number, assessmentBase: number, premium: number }}
 */
export const calculateOsvcSocialInsurance = ({
  income,
  expenses,
  rates,
}: {
  income: number
  expenses: number
  rates: { profitShare: number; minimumAssessmentBase: number; maximumAssessmentBase: number }
}) => {
  const profit = income - expenses
  // truncate to 3 decimals before rounding up, as the reference library does, to drop float noise
  const calculatedAssessmentBase = Math.ceil(floorDivide(10 ** 9 * profit * rates.profitShare, 10 ** 6) / 10 ** 3)
  const assessmentBase =
    rates.minimumAssessmentBase >= calculatedAssessmentBase
      ? rates.minimumAssessmentBase
      : Math.min(calculatedAssessmentBase, rates.maximumAssessmentBase)
  const premium = Math.ceil(assessmentBase * SOCIAL_PREMIUM_RATE)
  return { profit, calculatedAssessmentBase, assessmentBase, premium }
}
