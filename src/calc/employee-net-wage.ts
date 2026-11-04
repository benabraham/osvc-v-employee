import type { ChildCreditsMonthly } from './osvc-income-tax'
import { modulo, roundHalfAwayFromZero } from './rounding'

export type EmployeeNetWageRates = {
  minimumWage: number
  /** monthly minimum health premium; the employee tops up to it below the minimum wage (until 2023) */
  minimumEmployeeHealthPremium?: number
  /** employee health insurance rate; the employer pays twice this */
  healthRate: number
  socialRate: number
  socialRateRetired?: number
  /** separate employee sickness insurance (2024: 0.6 %, on top of 6.5 % social) */
  sicknessRate?: number
  employerSocialRate: number
  baseTaxRate: number
  solidarityTaxRate: number
  monthlySolidarityThreshold: number
  payerCredit: number
  studentCredit?: number
  ztpHolderCredit: number
  disabilityDegree1or2Credit: number
  disabilityDegree3Credit: number
  childCreditsMonthly: ChildCreditsMonthly
}

const childCreditFor = ({ children, credits }: { children: number; credits: ChildCreditsMonthly }) =>
  (children >= 1 ? credits.first : 0) +
  (children >= 2 ? credits.second : 0) +
  Math.max(0, children - 2) * credits.thirdAndMore

/**
 * Monthly employee net wage (čistá mzda) from gross, with the employee's insurance, the tax advance,
 * monthly credits and the child credit or bonus. Employer contributions are returned too.
 *
 * @param {object} params
 * @param {number} params.grossWage monthly gross wage (hrubá mzda)
 * @param {number} [params.children=0] children the child credit is claimed for
 * @param {boolean} [params.isStudent=false] student credit (only years that have it)
 * @param {boolean} [params.isExemptFromMinimumHealthBase=false] students, pensioners, parents on leave… pay no top-up
 * @param {boolean} [params.isRetired=false] working pensioner (lower social rate from 2026)
 * @param {boolean} [params.ztpHolder=false]
 * @param {boolean} [params.disabilityDegree1or2=false]
 * @param {boolean} [params.disabilityDegree3=false]
 * @param {EmployeeNetWageRates} params.rates
 */
export const calculateEmployeeNetWage = ({
  grossWage,
  children = 0,
  isStudent = false,
  isExemptFromMinimumHealthBase = false,
  isRetired = false,
  ztpHolder = false,
  disabilityDegree1or2 = false,
  disabilityDegree3 = false,
  rates,
}: {
  grossWage: number
  children?: number
  isStudent?: boolean
  isExemptFromMinimumHealthBase?: boolean
  isRetired?: boolean
  ztpHolder?: boolean
  disabilityDegree1or2?: boolean
  disabilityDegree3?: boolean
  rates: EmployeeNetWageRates
}) => {
  const employerHealthInsurance = Math.ceil(grossWage * 2 * rates.healthRate)
  const paysProportionalHealth =
    isExemptFromMinimumHealthBase || grossWage > rates.minimumWage || rates.minimumEmployeeHealthPremium === undefined
  const employeeHealthInsurance = paysProportionalHealth
    ? Math.ceil(grossWage * rates.healthRate)
    : (rates.minimumEmployeeHealthPremium ?? 0) - employerHealthInsurance

  const socialRate = isRetired ? (rates.socialRateRetired ?? rates.socialRate) : rates.socialRate
  const employeeSocialInsurance = Math.ceil(grossWage * socialRate)
  const employerSocialInsurance = Math.ceil(grossWage * rates.employerSocialRate)
  const employeeSicknessInsurance = rates.sicknessRate === undefined ? 0 : Math.ceil(grossWage * rates.sicknessRate)

  // the advance base rounds up to whole hundreds
  const taxBase = grossWage - modulo(grossWage, -100)
  const threshold = rates.monthlySolidarityThreshold
  const taxAtBaseRate = roundHalfAwayFromZero(rates.baseTaxRate * (grossWage >= threshold ? threshold : taxBase), 8)
  const taxAtSolidarityRate = roundHalfAwayFromZero(
    rates.solidarityTaxRate * (grossWage > threshold ? taxBase - threshold : 0),
    8,
  )
  const taxBeforeCredits = Math.ceil(taxAtBaseRate + taxAtSolidarityRate)

  const payerCredit = rates.payerCredit
  const studentCredit = isStudent ? (rates.studentCredit ?? 0) : 0
  const ztpHolderCredit = ztpHolder ? rates.ztpHolderCredit : 0
  const disabilityDegree1or2Credit = disabilityDegree1or2 ? rates.disabilityDegree1or2Credit : 0
  const disabilityDegree3Credit = disabilityDegree3 ? rates.disabilityDegree3Credit : 0
  const creditsTotal = payerCredit + studentCredit + ztpHolderCredit + disabilityDegree1or2Credit + disabilityDegree3Credit
  const taxAfterCredits = Math.max(0, taxBeforeCredits - creditsTotal)

  const childCredit = childCreditFor({ children, credits: rates.childCreditsMonthly })
  const taxAfterChildCredit = Math.max(0, taxAfterCredits - childCredit)
  const childBonus = Math.max(0, childCredit - taxAfterCredits)

  const netWage =
    grossWage -
    employeeHealthInsurance -
    employeeSocialInsurance -
    employeeSicknessInsurance -
    taxAfterChildCredit +
    childBonus

  return {
    employerHealthInsurance,
    employeeHealthInsurance,
    employeeSocialInsurance,
    employerSocialInsurance,
    employeeSicknessInsurance,
    taxBase,
    taxAtBaseRate,
    taxAtSolidarityRate,
    taxBeforeCredits,
    payerCredit,
    studentCredit,
    ztpHolderCredit,
    disabilityDegree1or2Credit,
    disabilityDegree3Credit,
    creditsTotal,
    taxAfterCredits,
    childCredit,
    taxAfterChildCredit,
    childBonus,
    netWage,
  }
}
