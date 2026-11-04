/**
 * The benefit comparison of the benefits screen: what an employee and an OSVČ receive in sickness, maternity and
 * paternity benefit for the same monthly income. Pure functions over the calculators in src/calc.
 */
import {
  calculateMaternityBenefit,
  calculateOsvcMaternityBenefit,
  calculateOsvcSicknessBenefit,
  calculateOsvcSicknessInsurance,
  calculateSalaryCompensation,
  calculateSicknessBenefit,
  roundHalfAwayFromZero,
  type OsvcBenefitRates,
  type ReductionThresholds,
} from '../../calc'

/** § 192 odst. 1 zákoníku práce: the employer pays salary compensation for the first 14 calendar days of sickness. */
export const EMPLOYER_COMPENSATION_CALENDAR_DAYS = 14
/** § 192 odst. 2 zákoníku práce: the sickness reduction thresholds are multiplied by 0.175 for hourly earnings. */
export const HOURLY_THRESHOLD_FACTOR = 0.175
/** Hours in one full working day (40-hour week over five days). */
export const HOURS_PER_WORKING_DAY = 8
/** § 38b odst. 1 zákona 187/2006 Sb.: the paternity benefit period is two weeks, so 14 calendar days. */
export const PATERNITY_DAYS = 14
/** § 33 písm. a) zákona 187/2006 Sb.: maternity benefit for one child, in weeks. */
export const MATERNITY_WEEKS_SINGLE_BIRTH = 28
/** § 33 písm. b) zákona 187/2006 Sb.: maternity benefit after two or more children born at once, in weeks. */
export const MATERNITY_WEEKS_MULTIPLE_BIRTH = 37

/**
 * Days of sickness the sickness benefit pays for: from day 15. The first 14 calendar days are paid by the employer
 * (§ 192 odst. 1 zákoníku práce) for an employee, and by nobody for an OSVČ.
 *
 * @param {object} params
 * @param {number} params.sicknessDays calendar days of incapacity
 * @returns {number} days paid by the sickness insurance, never negative
 */
export const benefitDaysFor = ({ sicknessDays }: { sicknessDays: number }): number =>
  Math.max(0, sicknessDays - EMPLOYER_COMPENSATION_CALENDAR_DAYS)

/**
 * Working days in the first calendar days of sickness, averaged as five of every seven. Holidays are not counted.
 *
 * @param {object} params
 * @param {number} params.calendarDays calendar days of sickness
 * @returns {number} working days, rounded to whole days
 */
export const workingDaysInCalendarDays = ({ calendarDays }: { calendarDays: number }): number =>
  Math.round((calendarDays * 5) / 7)

/**
 * Average hourly earnings of an employee (průměrný hodinový výdělek, § 356 odst. 1 zákoníku práce), estimated as the
 * monthly gross over twelve months divided by the working hours of the year.
 *
 * @param {object} params
 * @param {number} params.monthlyGross
 * @param {number} params.workingHoursPerYear
 * @returns {number} Kč per hour, 0 when there are no working hours
 */
export const averageHourlyEarningsFor = ({
  monthlyGross,
  workingHoursPerYear,
}: {
  monthlyGross: number
  workingHoursPerYear: number
}): number => {
  if (workingHoursPerYear <= 0) return 0
  return (monthlyGross * 12) / workingHoursPerYear
}

/**
 * The three reduction thresholds for hourly earnings (salary compensation): each daily sickness threshold multiplied
 * by 0.175 and rounded up to haléře (§ 192 odst. 2 zákoníku práce, which refers to § 22 zákona 187/2006 Sb.).
 *
 * @param {object} params
 * @param {{ reductionThresholds: ReductionThresholds }} params.rates the year's daily sickness thresholds
 * @returns {ReductionThresholds} the hourly thresholds in Kč
 */
export const hourlyReductionThresholdsFor = ({ rates }: { rates: { reductionThresholds: ReductionThresholds } }): ReductionThresholds => {
  // haléře: scaled to hundredths and cleaned of float noise before rounding up, so 271.6 stays 271.60
  const toHourly = (dailyThreshold: number) =>
    Math.ceil(roundHalfAwayFromZero(dailyThreshold * HOURLY_THRESHOLD_FACTOR * 100, 6)) / 100
  const [first, second, third] = rates.reductionThresholds
  return [toHourly(first), toHourly(second), toHourly(third)]
}

/**
 * The monthly premium and assessment base of the OSVČ for the comparison: the calculated ones when the voluntary
 * sickness insurance is on, else the minimum of the year (§ 5b zákona 589/1992 Sb.) as if the user paid it.
 *
 * @param {object} params
 * @param {boolean} params.isEnabled whether the sickness insurance is on in the calculation
 * @param {{ monthlyPremium: number, monthlyAssessmentBase: number }} params.sicknessInsurance the calculated values (zero when off)
 * @param {{ sicknessInsuranceRatePercent: number, employeeEligibilityThreshold: number }} params.rates
 * @returns {{ monthlyPremium: number, monthlyAssessmentBase: number, isMinimum: boolean }}
 */
export const osvcPremiumForBenefits = ({
  isEnabled,
  sicknessInsurance,
  rates,
}: {
  isEnabled: boolean
  sicknessInsurance: { monthlyPremium: number; monthlyAssessmentBase: number }
  rates: { sicknessInsuranceRatePercent: number; employeeEligibilityThreshold: number }
}) => {
  if (isEnabled) {
    return {
      monthlyPremium: sicknessInsurance.monthlyPremium,
      monthlyAssessmentBase: sicknessInsurance.monthlyAssessmentBase,
      isMinimum: false,
    }
  }
  const minimum = calculateOsvcSicknessInsurance({ rates })
  return { monthlyPremium: minimum.monthlyPremium, monthlyAssessmentBase: minimum.monthlyAssessmentBase, isMinimum: true }
}

/**
 * Every benefit amount for an employee and an OSVČ with the same monthly income, for one year's rates.
 *
 * Sickness: the employee gets salary compensation from the employer for the first 14 calendar days (§ 192 zákoníku
 * práce, 60 % of the reduced hourly earnings) and sickness benefit from day 15; the OSVČ gets nothing for days 1–14
 * and sickness benefit from day 15. The OSVČ waiting period (§ 24) is checked in benefit-eligibility, not here.
 * Maternity and paternity: the daily amount is 70 % of the daily base reduced by § 21 odst. 1 písm. b) (§ 37 for maternity, § 38c for paternity).
 *
 * @param {object} params
 * @param {number} params.employeeMonthlyGross the employee's monthly gross wage, Kč
 * @param {number} params.osvcMonthlySicknessPremium the OSVČ's monthly sickness premium, Kč
 * @param {number} params.sicknessDays calendar days of sickness
 * @param {number} params.maternityWeeks 28, or 37 after a multiple birth (§ 33 zákona 187/2006 Sb.)
 * @param {number} params.workingHoursPerYear hours the employee works in the year, for the hourly earnings
 * @param {OsvcBenefitRates} params.rates the year's reduction thresholds and sickness insurance rate
 */
export const compareBenefits = ({
  employeeMonthlyGross,
  osvcMonthlySicknessPremium,
  sicknessDays,
  maternityWeeks,
  workingHoursPerYear,
  rates,
}: {
  employeeMonthlyGross: number
  osvcMonthlySicknessPremium: number
  sicknessDays: number
  maternityWeeks: number
  workingHoursPerYear: number
  rates: OsvcBenefitRates
}) => {
  const benefitDays = benefitDaysFor({ sicknessDays })
  const hoursOfIncapacity =
    workingDaysInCalendarDays({ calendarDays: Math.min(Math.max(sicknessDays, 0), EMPLOYER_COMPENSATION_CALENDAR_DAYS) }) *
    HOURS_PER_WORKING_DAY
  const averageHourlyEarnings = averageHourlyEarningsFor({ monthlyGross: employeeMonthlyGross, workingHoursPerYear })
  const hourlyReductionThresholds = hourlyReductionThresholdsFor({ rates })

  const salaryCompensation = calculateSalaryCompensation({
    averageHourlyEarnings,
    hoursOfIncapacity,
    rates: { reductionThresholds: hourlyReductionThresholds },
  })
  const employeeSicknessBenefit = calculateSicknessBenefit({
    monthlyAssessmentBase: employeeMonthlyGross,
    benefitDays,
    rates,
  })
  const employeeMaternity = calculateMaternityBenefit({ monthlyAssessmentBase: employeeMonthlyGross, rates })

  const osvcSicknessBenefit = calculateOsvcSicknessBenefit({
    monthlySicknessPremium: osvcMonthlySicknessPremium,
    benefitDays,
    rates,
  })
  const osvcMaternity = calculateOsvcMaternityBenefit({ monthlySicknessPremium: osvcMonthlySicknessPremium, rates })

  return {
    benefitDays,
    hoursOfIncapacity,
    averageHourlyEarnings,
    hourlyReductionThresholds,
    employee: {
      salaryCompensation,
      sicknessBenefit: employeeSicknessBenefit,
      sicknessTotal: salaryCompensation.totalCompensation + employeeSicknessBenefit.totalBenefit,
      maternity: employeeMaternity,
      maternityTotal: employeeMaternity.weeklyBenefit * maternityWeeks,
      paternityTotal: employeeMaternity.dailyBenefit * PATERNITY_DAYS,
    },
    osvc: {
      sicknessBenefit: osvcSicknessBenefit,
      sicknessTotal: osvcSicknessBenefit.totalBenefit,
      maternity: osvcMaternity,
      maternityTotal: osvcMaternity.weeklyBenefit * maternityWeeks,
      paternityTotal: osvcMaternity.dailyBenefit * PATERNITY_DAYS,
    },
  }
}
