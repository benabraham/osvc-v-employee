import { roundHalfAwayFromZero } from './rounding'

/** Flat-rate expense rates allowed by § 7 odst. 7 zákona 586/1992 Sb. */
export type ExpenseRate = 0.3 | 0.4 | 0.6 | 0.8

/** § 7 odst. 7: each rate's expenses are capped, which equals the rate × 2 000 000 Kč of income. */
export const FLAT_RATE_EXPENSE_CAPS: Record<ExpenseRate, number> = {
  0.8: 1_600_000,
  0.6: 1_200_000,
  0.4: 800_000,
  0.3: 600_000,
}

/**
 * Flat-rate expenses (výdajový paušál).
 *
 * @param {object} params
 * @param {number} params.income yearly income from self-employment
 * @param {ExpenseRate} params.expenseRate 0.8 crafts and farming, 0.6 other trades, 0.4 other self-employment, 0.3 rent
 * @returns {{ expenseRate: ExpenseRate, cap: number, expenses: number }}
 */
export const calculateFlatRateExpenses = ({ income, expenseRate }: { income: number; expenseRate: ExpenseRate }) => {
  const cap = FLAT_RATE_EXPENSE_CAPS[expenseRate]
  return { expenseRate, cap, expenses: Math.min(Math.round(income * expenseRate * 100) / 100, cap) }
}

/** § 2a odst. 5: share of income at a 60 % or 80 % rate that unlocks a higher band limit. */
export const PAUSALNI_DAN_QUALIFYING_SHARE = 0.75

/**
 * The lowest paušální daň band whose income limit covers the income (§ 2a odst. 5), or null above all bands.
 *
 * Band 1: 1 000 000 Kč; 1 500 000 Kč if ≥ 75 % of income is at 60 % or 80 %; 2 000 000 Kč if ≥ 75 % is at 80 %.
 * Band 2: 1 500 000 Kč; 2 000 000 Kč if ≥ 75 % of income is at 60 % or 80 %.
 * Band 3: 2 000 000 Kč.
 *
 * @param {object} params
 * @param {number} params.income yearly self-employment income (rozhodné příjmy)
 * @param {number} [params.shareAt80Percent=0] share of income with an 80 % expense rate (0–1)
 * @param {number} [params.shareAt60Or80Percent=0] share of income with a 60 % or 80 % expense rate (0–1)
 * @returns {{ band: 1 | 2 | 3 | null, limit: number | null }}
 */
export const pausalniDanBandFor = ({
  income,
  shareAt80Percent = 0,
  shareAt60Or80Percent = 0,
}: {
  income: number
  shareAt80Percent?: number
  shareAt60Or80Percent?: number
}): { band: 1 | 2 | 3 | null; limit: number | null } => {
  const isMostlyAt80 = shareAt80Percent >= PAUSALNI_DAN_QUALIFYING_SHARE
  const isMostlyAt60Or80 = Math.max(shareAt60Or80Percent, shareAt80Percent) >= PAUSALNI_DAN_QUALIFYING_SHARE
  const limits = [
    [1, isMostlyAt80 ? 2_000_000 : isMostlyAt60Or80 ? 1_500_000 : 1_000_000],
    [2, isMostlyAt60Or80 ? 2_000_000 : 1_500_000],
    [3, 2_000_000],
  ] as const
  const match = limits.find(([, limit]) => income <= limit)
  return match ? { band: match[0], limit: match[1] } : { band: null, limit: null }
}

/**
 * Yearly paušální daň for a band. The monthly amounts are published for each year
 * (they bundle income tax, health and social insurance).
 *
 * @param {object} params
 * @param {1 | 2 | 3} params.band
 * @param {{ monthlyAmounts: [number, number, number] }} params.rates monthly amount for bands 1, 2 and 3
 * @returns {{ band: 1 | 2 | 3, monthlyAmount: number, yearlyAmount: number }}
 */
export const calculatePausalniDan = ({
  band,
  rates,
}: {
  band: 1 | 2 | 3
  rates: { monthlyAmounts: [number, number, number] }
}) => {
  const monthlyAmount = rates.monthlyAmounts[band - 1] ?? 0
  return { band, monthlyAmount, yearlyAmount: monthlyAmount * 12 }
}

/**
 * Monthly income from which employees take part in sickness insurance (rozhodný příjem, zákon 187/2006 Sb. § 6 odst. 2).
 * It rises from January to a tenth of the average wage rounded down to 500 Kč when that is higher.
 *
 * @param {object} params
 * @param {number} params.averageWage average wage used for the year (všeobecný vyměřovací základ × koeficient)
 * @param {number} params.previousThreshold the amount valid so far (4 500 Kč in 2025)
 * @returns {number}
 */
export const sicknessEligibilityThresholdFor = ({
  averageWage,
  previousThreshold,
}: {
  averageWage: number
  previousThreshold: number
}) => Math.max(previousThreshold, Math.floor(averageWage / 10 / 500) * 500)

/** zákon 589/1992 Sb. § 5b odst. 4: the minimum monthly sickness base is twice the employee threshold. */
export const OSVC_SICKNESS_MINIMUM_BASE_MULTIPLE = 2

/**
 * OSVČ voluntary sickness insurance premium (nemocenské pojištění OSVČ, 2.7 % from 2024).
 *
 * @param {object} params
 * @param {number} [params.monthlyAssessmentBase] base the OSVČ chooses; omitted means the minimum
 * @param {number} [params.maximumMonthlyAssessmentBase] monthly average of the last yearly SP base (§ 5b odst. 4)
 * @param {{ sicknessInsuranceRatePercent: number, employeeEligibilityThreshold: number }} params.rates
 */
export const calculateOsvcSicknessInsurance = ({
  monthlyAssessmentBase,
  maximumMonthlyAssessmentBase = Number.POSITIVE_INFINITY,
  rates,
}: {
  monthlyAssessmentBase?: number
  maximumMonthlyAssessmentBase?: number
  rates: { sicknessInsuranceRatePercent: number; employeeEligibilityThreshold: number }
}) => {
  const minimumMonthlyAssessmentBase = OSVC_SICKNESS_MINIMUM_BASE_MULTIPLE * rates.employeeEligibilityThreshold
  const chosenBase = monthlyAssessmentBase ?? minimumMonthlyAssessmentBase
  const appliedBase = Math.min(Math.max(chosenBase, minimumMonthlyAssessmentBase), maximumMonthlyAssessmentBase)
  // premiums round up to whole crowns; dividing by 100 last keeps 2.7 % exact
  const monthlyPremium = Math.ceil((appliedBase * rates.sicknessInsuranceRatePercent) / 100)
  return {
    minimumMonthlyAssessmentBase,
    monthlyAssessmentBase: appliedBase,
    monthlyPremium,
    yearlyPremium: monthlyPremium * 12,
  }
}

const ceilClean = (value: number) => Math.ceil(roundHalfAwayFromZero(value, 8))

/**
 * OSVČ minimum and maximum bases for a year, all derived from the average wage (průměrná mzda).
 * The minimum SP share is 35 % of the average wage (25 % in the first three years of a new OSVČ, § 14 odst. 5).
 *
 * @param {object} params
 * @param {number} params.averageWage average wage for the year
 * @param {boolean} [params.isNewOsvc=false] start year or the two after it (see isNewOsvcFor)
 * @param {{ socialMinimumShare: number, newOsvcSocialMinimumShare?: number }} params.rates
 *   share of the average wage for the minimum monthly SP base, and the lower share for a new OSVČ
 */
export const calculateOsvcMinimums = ({
  averageWage,
  isNewOsvc = false,
  rates,
}: {
  averageWage: number
  isNewOsvc?: boolean
  rates: { socialMinimumShare: number; newOsvcSocialMinimumShare?: number }
}) => {
  const socialMinimumShare = isNewOsvc
    ? (rates.newOsvcSocialMinimumShare ?? rates.socialMinimumShare)
    : rates.socialMinimumShare
  // zákon 592/1992 Sb. § 3a odst. 2: twelve times 50 % of the average wage
  const minimumHealthMonthlyBase = averageWage * 0.5
  const minimumHealthYearlyBase = averageWage * 6
  const minimumHealthMonthlyPremium = ceilClean(minimumHealthMonthlyBase * 0.135)
  // zákon 589/1992 Sb. § 14 odst. 5
  const minimumSocialMonthlyBase = ceilClean(averageWage * socialMinimumShare)
  const minimumSocialYearlyBase = minimumSocialMonthlyBase * 12
  const minimumSocialMonthlyPremium = ceilClean(minimumSocialMonthlyBase * 0.292)
  return {
    minimumHealthMonthlyBase,
    minimumHealthYearlyBase,
    minimumHealthMonthlyPremium,
    minimumSocialMonthlyBase,
    minimumSocialYearlyBase,
    minimumSocialMonthlyPremium,
    /** zákon 589/1992 Sb. § 15a: 48 × the average wage */
    maximumSocialYearlyBase: averageWage * 48,
    /** zákon 586/1992 Sb. § 16: the 23 % rate applies above 36 × the average wage */
    solidarityThreshold: averageWage * 36,
  }
}

/**
 * Fixed parts of the paušální daň in the current acts: the income tax advance (zákon 586/1992 Sb. § 38lk odst. 7),
 * the SP monthly base for bands 2 and 3 (zákon 589/1992 Sb. § 14 odst. 3) and the yearly ZP base for bands 2
 * and 3 (zákon 592/1992 Sb. § 3a odst. 5).
 */
export const PAUSALNI_DAN_FIXED = {
  taxParts: [100, 4_963, 9_320],
  socialMonthlyBases: [28_050, 42_900],
  healthYearlyBases: [319_200, 470_400],
} as const

/**
 * Monthly paušální daň for bands 1, 2 and 3 in a year.
 *
 * Band 1 is the minimum ZP and SP premiums, the SP raised by 15 %, plus 100 Kč of tax. Raising the minimum SP
 * premium (not its base) by 15 % reproduces every published amount for 2024–2027 (7 498, 8 716, 9 162, 9 662 Kč);
 * raising the base first, as § 14 odst. 3 reads, would give 1 Kč less in 2025 and 2027.
 *
 * @param {object} params
 * @param {number} params.averageWage average wage for the year
 * @param {{ socialMinimumShare: number }} params.rates
 * @returns {{ monthlyAmounts: [number, number, number] }}
 */
export const calculatePausalniDanMonthlyAmounts = ({
  averageWage,
  rates,
}: {
  averageWage: number
  rates: { socialMinimumShare: number }
}): { monthlyAmounts: [number, number, number] } => {
  const minimums = calculateOsvcMinimums({ averageWage, rates })
  const { taxParts, socialMonthlyBases, healthYearlyBases } = PAUSALNI_DAN_FIXED
  const band1 = taxParts[0] + minimums.minimumHealthMonthlyPremium + ceilClean(minimums.minimumSocialMonthlyPremium * 1.15)
  const fixedBand = (index: 0 | 1) =>
    taxParts[index + 1]! + ceilClean((healthYearlyBases[index] / 12) * 0.135) + ceilClean(socialMonthlyBases[index] * 0.292)
  return { monthlyAmounts: [band1, fixedBand(0), fixedBand(1)] }
}

/**
 * Average wage for insurance purposes (průměrná mzda): the general assessment base from two years earlier
 * times its conversion coefficient, rounded up to whole crowns. Both come from a yearly nařízení vlády.
 *
 * @param {object} params
 * @param {number} params.generalAssessmentBase všeobecný vyměřovací základ
 * @param {number} params.conversionCoefficient přepočítací koeficient
 * @returns {number}
 */
export const averageWageFor = ({
  generalAssessmentBase,
  conversionCoefficient,
}: {
  generalAssessmentBase: number
  conversionCoefficient: number
}) => ceilClean(generalAssessmentBase * conversionCoefficient)

/** zákon 589/1992 Sb. § 14 odst. 5: the start year and the 2 following years… */
export const NEW_OSVC_YEARS_AFTER_START = 2

/**
 * Whether the lower minimum SP base for a new OSVČ applies in a year: the start year and the two after it,
 * unless the person was an OSVČ in the 20 years before starting.
 *
 * @param {object} params
 * @param {number} params.year the year the minimum is for
 * @param {number} params.startYear year the main self-employment started
 * @param {boolean} [params.wasOsvcInPrevious20Years=false]
 * @returns {boolean}
 */
export const isNewOsvcFor = ({
  year,
  startYear,
  wasOsvcInPrevious20Years = false,
}: {
  year: number
  startYear: number
  wasOsvcInPrevious20Years?: boolean
}) => !wasOsvcInPrevious20Years && year >= startYear && year - startYear <= NEW_OSVC_YEARS_AFTER_START
