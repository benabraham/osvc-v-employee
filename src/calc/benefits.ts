import { roundHalfAwayFromZero } from './rounding'

/** The three reduction thresholds (redukční hranice) for the daily or hourly assessment base. */
export type ReductionThresholds = [first: number, second: number, third: number]
export type BenefitRates = { reductionThresholds: ReductionThresholds }
export type OsvcBenefitRates = BenefitRates & {
  /** voluntary OSVČ sickness insurance rate in percent (2.7 from 2024) */
  sicknessInsuranceRatePercent: number
}

const roundToCents = (value: number) => roundHalfAwayFromZero(value, 2)
const roundTo4 = (value: number) => roundHalfAwayFromZero(value, 4)

/**
 * Daily assessment base (denní vyměřovací základ) from a monthly income: 12 months over 365 days.
 *
 * @param {object} params
 * @param {number} params.monthlyAssessmentBase average monthly gross wage, or the OSVČ monthly base
 * @returns {number}
 */
export const dailyAssessmentBaseFor = ({ monthlyAssessmentBase }: { monthlyAssessmentBase: number }) =>
  roundToCents((12 * monthlyAssessmentBase) / 365.0)

/**
 * OSVČ monthly assessment base implied by the voluntary sickness insurance premium paid.
 *
 * @param {object} params
 * @param {number} params.monthlySicknessPremium monthly voluntary sickness insurance premium
 * @param {OsvcBenefitRates} params.rates
 * @returns {number}
 */
export const osvcMonthlyAssessmentBaseFor = ({
  monthlySicknessPremium,
  rates,
}: {
  monthlySicknessPremium: number
  rates: Pick<OsvcBenefitRates, 'sicknessInsuranceRatePercent'>
}) => Math.ceil((100 * monthlySicknessPremium) / rates.sicknessInsuranceRatePercent)

/** Bands for sickness benefit: 90 % up to the first threshold, 60 % to the second, 30 % to the third. */
const sicknessBands = ({ dailyAssessmentBase, thresholds }: { dailyAssessmentBase: number; thresholds: ReductionThresholds }) => {
  const [first, second, third] = thresholds
  const firstBand = 0.9 * Math.min(first, dailyAssessmentBase)
  const secondBand = Math.max(0, 0.6 * (Math.min(second, dailyAssessmentBase) - first))
  const thirdBand = Math.max(0, 0.3 * (Math.min(third, dailyAssessmentBase) - second))
  return {
    reducedFirstBand: roundToCents(firstBand),
    reducedSecondBand: roundToCents(secondBand),
    reducedThirdBand: roundToCents(thirdBand),
    // sickness benefit sums the unrounded bands
    reducedDailyBase: Math.ceil(firstBand + secondBand + thirdBand),
  }
}

/**
 * Sickness benefit (nemocenské). It is paid from day 15 of incapacity, so `benefitDays` counts from there:
 * 60 % for the first 16 days (days 15–30), 66 % for the next 30 (days 31–60), 72 % after that.
 *
 * @param {object} params
 * @param {number} params.monthlyAssessmentBase average monthly gross wage
 * @param {number} params.benefitDays days the benefit is paid for
 * @param {BenefitRates} params.rates
 */
export const calculateSicknessBenefit = ({
  monthlyAssessmentBase,
  benefitDays,
  rates,
}: {
  monthlyAssessmentBase: number
  benefitDays: number
  rates: BenefitRates
}) => {
  const dailyAssessmentBase = dailyAssessmentBaseFor({ monthlyAssessmentBase })
  const bands = sicknessBands({ dailyAssessmentBase, thresholds: rates.reductionThresholds })
  const dailyBenefitDays15To30 = Math.ceil(bands.reducedDailyBase * 0.6)
  const dailyBenefitDays31To60 = Math.ceil(bands.reducedDailyBase * 0.66)
  const dailyBenefitFrom61 = Math.ceil(bands.reducedDailyBase * 0.72)

  const firstPeriod = Math.min(benefitDays, 16) * dailyBenefitDays15To30
  const secondPeriod = benefitDays > 16 ? Math.min(benefitDays - 16, 30) * dailyBenefitDays31To60 : 0
  const thirdPeriod = benefitDays > 46 ? (benefitDays - 46) * dailyBenefitFrom61 : 0

  return {
    dailyAssessmentBase,
    ...bands,
    dailyBenefitDays15To30,
    dailyBenefitDays31To60,
    dailyBenefitFrom61,
    totalBenefit: firstPeriod + secondPeriod + thirdPeriod,
  }
}

/**
 * OSVČ sickness benefit; the assessment base comes from the voluntary sickness insurance premium.
 *
 * @param {object} params
 * @param {number} params.monthlySicknessPremium
 * @param {number} params.benefitDays
 * @param {OsvcBenefitRates} params.rates
 */
export const calculateOsvcSicknessBenefit = ({
  monthlySicknessPremium,
  benefitDays,
  rates,
}: {
  monthlySicknessPremium: number
  benefitDays: number
  rates: OsvcBenefitRates
}) => {
  const monthlyAssessmentBase = osvcMonthlyAssessmentBaseFor({ monthlySicknessPremium, rates })
  return { monthlyAssessmentBase, ...calculateSicknessBenefit({ monthlyAssessmentBase, benefitDays, rates }) }
}

/**
 * Carer's allowance (ošetřovné), short or long term: 60 % of the reduced daily base for each care day.
 *
 * @param {object} params
 * @param {number} params.monthlyAssessmentBase
 * @param {number} params.careDays
 * @param {BenefitRates} params.rates
 */
export const calculateCarersAllowance = ({
  monthlyAssessmentBase,
  careDays,
  rates,
}: {
  monthlyAssessmentBase: number
  careDays: number
  rates: BenefitRates
}) => {
  const dailyAssessmentBase = dailyAssessmentBaseFor({ monthlyAssessmentBase })
  const [first, second, third] = rates.reductionThresholds
  const reducedFirstBand = roundToCents(0.9 * Math.min(first, dailyAssessmentBase))
  const reducedSecondBand = roundToCents(Math.max(0, 0.6 * (Math.min(second, dailyAssessmentBase) - first)))
  const reducedThirdBand = roundToCents(Math.max(0, 0.3 * (Math.min(third, dailyAssessmentBase) - second)))
  // carer's allowance sums the rounded bands
  const reducedDailyBase = Math.ceil(reducedFirstBand + reducedSecondBand + reducedThirdBand)
  const dailyBenefit = Math.ceil(reducedDailyBase * 0.6)
  return {
    dailyAssessmentBase,
    reducedFirstBand,
    reducedSecondBand,
    reducedThirdBand,
    reducedDailyBase,
    dailyBenefit,
    totalBenefit: dailyBenefit * careDays,
  }
}

/**
 * Salary compensation (náhrada mzdy) the employer pays for the first 14 days of sickness:
 * 60 % of the reduced average hourly earnings for each lost working hour.
 *
 * @param {object} params
 * @param {number} params.averageHourlyEarnings
 * @param {number} params.hoursOfIncapacity working hours missed
 * @param {BenefitRates} params.rates hourly reduction thresholds
 */
export const calculateSalaryCompensation = ({
  averageHourlyEarnings,
  hoursOfIncapacity,
  rates,
}: {
  averageHourlyEarnings: number
  hoursOfIncapacity: number
  rates: BenefitRates
}) => {
  const [first, second, third] = rates.reductionThresholds
  const reducedFirstBand = roundTo4(0.9 * Math.min(first, averageHourlyEarnings))
  const reducedSecondBand =
    averageHourlyEarnings > first ? roundTo4(0.6 * (Math.min(averageHourlyEarnings, second) - first)) : 0
  const reducedThirdBand =
    averageHourlyEarnings > second ? roundTo4(0.3 * (Math.min(averageHourlyEarnings, third) - second)) : 0
  const reducedHourlyBase = roundTo4(reducedFirstBand + reducedSecondBand + reducedThirdBand)
  const hourlyCompensation = roundTo4(reducedHourlyBase * 0.6)
  return {
    reducedFirstBand,
    reducedSecondBand,
    reducedThirdBand,
    reducedHourlyBase,
    hourlyCompensation,
    totalCompensation: Math.ceil(hourlyCompensation * hoursOfIncapacity),
  }
}

/**
 * Maternity benefit (peněžitá pomoc v mateřství), also used for paternity benefit (otcovská, 14 days):
 * 70 % of the reduced daily base. Bands: 100 % to the first threshold, 60 % to the second, 30 % to the third.
 *
 * @param {object} params
 * @param {number} params.monthlyAssessmentBase
 * @param {BenefitRates} params.rates
 */
export const calculateMaternityBenefit = ({
  monthlyAssessmentBase,
  rates,
}: {
  monthlyAssessmentBase: number
  rates: BenefitRates
}) => {
  const dailyAssessmentBase = dailyAssessmentBaseFor({ monthlyAssessmentBase })
  const [first, second, third] = rates.reductionThresholds
  const reducedFirstBand = Math.min(first, dailyAssessmentBase)
  const reducedSecondBand = Math.max(0, roundToCents(0.6 * (Math.min(second, dailyAssessmentBase) - first)))
  const reducedThirdBand = Math.max(0, roundToCents(0.3 * (Math.min(third, dailyAssessmentBase) - second)))
  const reducedDailyBase = Math.ceil(reducedFirstBand + reducedSecondBand + reducedThirdBand)
  const dailyBenefit = Math.ceil(reducedDailyBase * 0.7)
  return {
    dailyAssessmentBase,
    reducedFirstBand,
    reducedSecondBand,
    reducedThirdBand,
    reducedDailyBase,
    dailyBenefit,
    weeklyBenefit: dailyBenefit * 7,
    fortnightBenefit: dailyBenefit * 14,
    monthlyBenefit: dailyBenefit * 30,
  }
}

/**
 * OSVČ maternity or paternity benefit; the assessment base comes from the voluntary sickness insurance premium.
 *
 * @param {object} params
 * @param {number} params.monthlySicknessPremium
 * @param {OsvcBenefitRates} params.rates
 */
export const calculateOsvcMaternityBenefit = ({
  monthlySicknessPremium,
  rates,
}: {
  monthlySicknessPremium: number
  rates: OsvcBenefitRates
}) => {
  const monthlyAssessmentBase = osvcMonthlyAssessmentBaseFor({ monthlySicknessPremium, rates })
  return { monthlyAssessmentBase, ...calculateMaternityBenefit({ monthlyAssessmentBase, rates }) }
}
