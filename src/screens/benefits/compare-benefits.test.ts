import { describe, expect, it } from 'vitest'
import {
  calculateMaternityBenefit,
  calculateOsvcMaternityBenefit,
  calculateOsvcSicknessBenefit,
  calculateSalaryCompensation,
  calculateSicknessBenefit,
} from '../../calc'
import { buildYearRates, TAX_YEARS, type TaxYearData } from '../../data/tax-years'
import {
  averageHourlyEarningsFor,
  benefitDaysFor,
  compareBenefits,
  hourlyReductionThresholdsFor,
  osvcPremiumForBenefits,
  workingDaysInCalendarDays,
} from './compare-benefits'

const yearDataFor = (year: number): TaxYearData => {
  const data = TAX_YEARS[year]
  if (!data) throw new Error(`no data for ${year}`)
  return data
}

const rates2025 = buildYearRates({ data: yearDataFor(2025), isNewOsvc: false }).benefits
const rates2026 = buildYearRates({ data: yearDataFor(2026), isNewOsvc: false }).benefits
const sicknessRates2026 = buildYearRates({ data: yearDataFor(2026), isNewOsvc: false }).sicknessInsurance

const baseInput = {
  employeeMonthlyGross: 50_000,
  osvcMonthlySicknessPremium: 243,
  sicknessDays: 30,
  maternityWeeks: 28,
  workingHoursPerYear: 2_000,
  rates: rates2026,
}

describe('hourlyReductionThresholdsFor', () => {
  it('multiplies each sickness threshold by 0.175 and rounds up to haléře (§ 192 odst. 2 zákoníku práce)', () => {
    expect(hourlyReductionThresholdsFor({ rates: rates2025 })).toEqual([271.6, 407.4, 814.8])
  })

  it('reproduces the reference library hourly thresholds of 2019 (1 090 / 1 635 / 3 270 Kč a day)', () => {
    const thresholds = hourlyReductionThresholdsFor({ rates: { reductionThresholds: [1090, 1635, 3270] } })
    expect(thresholds).toEqual([190.75, 286.13, 572.25])
  })
})

describe('workingDaysInCalendarDays', () => {
  it('counts five of every seven calendar days as working days', () => {
    expect(workingDaysInCalendarDays({ calendarDays: 14 })).toBe(10)
    expect(workingDaysInCalendarDays({ calendarDays: 7 })).toBe(5)
    expect(workingDaysInCalendarDays({ calendarDays: 0 })).toBe(0)
  })
})

describe('benefitDaysFor', () => {
  it('counts sickness benefit days from day 15, so 14 days are paid by the employer', () => {
    expect(benefitDaysFor({ sicknessDays: 30 })).toBe(16)
    expect(benefitDaysFor({ sicknessDays: 14 })).toBe(0)
    expect(benefitDaysFor({ sicknessDays: 5 })).toBe(0)
  })

  it('never goes below zero', () => {
    expect(benefitDaysFor({ sicknessDays: -3 })).toBe(0)
  })
})

describe('averageHourlyEarningsFor', () => {
  it('turns the monthly gross into an hourly figure over the year', () => {
    expect(averageHourlyEarningsFor({ monthlyGross: 50_000, workingHoursPerYear: 2_000 })).toBe(300)
  })

  it('gives zero instead of dividing by zero hours', () => {
    expect(averageHourlyEarningsFor({ monthlyGross: 50_000, workingHoursPerYear: 0 })).toBe(0)
  })
})

describe('osvcPremiumForBenefits', () => {
  it('uses the calculated premium and base when the sickness insurance is on', () => {
    const insurance = { monthlyPremium: 1_000, monthlyAssessmentBase: 37_038 }
    expect(osvcPremiumForBenefits({ isEnabled: true, sicknessInsurance: insurance, rates: sicknessRates2026 })).toEqual({
      monthlyPremium: 1_000,
      monthlyAssessmentBase: 37_038,
      isMinimum: false,
    })
  })

  it('uses the minimum premium of the year when the sickness insurance is off (§ 5b, 2 × rozhodný příjem)', () => {
    const { monthlyPremium, monthlyAssessmentBase, isMinimum } = osvcPremiumForBenefits({
      isEnabled: false,
      sicknessInsurance: { monthlyPremium: 0, monthlyAssessmentBase: 0 },
      rates: buildYearRates({ data: yearDataFor(2026), isNewOsvc: false }).sicknessInsurance,
    })
    expect(monthlyAssessmentBase).toBe(9_000)
    expect(monthlyPremium).toBe(243)
    expect(isMinimum).toBe(true)
  })
})

describe('compareBenefits', () => {
  it('gives the employee sickness benefit of the sickness calculator, from day 15', () => {
    const result = compareBenefits(baseInput)
    const expected = calculateSicknessBenefit({
      monthlyAssessmentBase: 50_000,
      benefitDays: 16,
      rates: rates2026,
    })
    expect(result.employee.sicknessBenefit.totalBenefit).toBe(expected.totalBenefit)
    expect(result.employee.sicknessBenefit.dailyBenefitDays15To30).toBe(expected.dailyBenefitDays15To30)
  })

  it('gives the OSVČ sickness benefit of the OSVČ calculator, from the premium', () => {
    const result = compareBenefits(baseInput)
    const expected = calculateOsvcSicknessBenefit({
      monthlySicknessPremium: 243,
      benefitDays: 16,
      rates: rates2026,
    })
    expect(result.osvc.sicknessBenefit.totalBenefit).toBe(expected.totalBenefit)
    expect(result.osvc.sicknessBenefit.monthlyAssessmentBase).toBe(expected.monthlyAssessmentBase)
  })

  it('gives the employee salary compensation for the first 14 days, with 80 hours for 10 working days', () => {
    const result = compareBenefits(baseInput)
    const hourlyThresholds = hourlyReductionThresholdsFor({ rates: rates2026 })
    const expected = calculateSalaryCompensation({
      averageHourlyEarnings: (50_000 * 12) / 2_000,
      hoursOfIncapacity: 80,
      rates: { reductionThresholds: hourlyThresholds },
    })
    expect(result.hoursOfIncapacity).toBe(80)
    expect(result.employee.salaryCompensation.totalCompensation).toBe(expected.totalCompensation)
    expect(result.employee.salaryCompensation.totalCompensation).toBeGreaterThan(0)
  })

  it('adds the salary compensation to the employee sickness total, and nothing for the OSVČ in days 1–14', () => {
    const result = compareBenefits(baseInput)
    expect(result.employee.sicknessTotal).toBe(
      result.employee.salaryCompensation.totalCompensation + result.employee.sicknessBenefit.totalBenefit,
    )
    expect(result.osvc.sicknessTotal).toBe(result.osvc.sicknessBenefit.totalBenefit)
  })

  it('pays no sickness benefit and only compensation for a sickness of 10 days', () => {
    const result = compareBenefits({ ...baseInput, sicknessDays: 10 })
    expect(result.employee.sicknessBenefit.totalBenefit).toBe(0)
    expect(result.employee.sicknessTotal).toBe(result.employee.salaryCompensation.totalCompensation)
    expect(result.osvc.sicknessTotal).toBe(0)
  })

  it('gives the maternity total as the daily benefit times 7 days per week of the chosen weeks', () => {
    const result = compareBenefits({ ...baseInput, maternityWeeks: 37 })
    const expectedDaily = calculateMaternityBenefit({ monthlyAssessmentBase: 50_000, rates: rates2026 })
    expect(result.employee.maternity.dailyBenefit).toBe(expectedDaily.dailyBenefit)
    expect(result.employee.maternityTotal).toBe(expectedDaily.dailyBenefit * 7 * 37)
  })

  it('gives the OSVČ maternity total from the premium-based base', () => {
    const result = compareBenefits(baseInput)
    const expectedDaily = calculateOsvcMaternityBenefit({ monthlySicknessPremium: 243, rates: rates2026 })
    expect(result.osvc.maternity.dailyBenefit).toBe(expectedDaily.dailyBenefit)
    expect(result.osvc.maternityTotal).toBe(expectedDaily.dailyBenefit * 7 * 28)
  })

  it('gives the paternity total of 14 days at the maternity daily amount, the same as the fortnight figure', () => {
    const result = compareBenefits(baseInput)
    const expectedFortnight = calculateMaternityBenefit({ monthlyAssessmentBase: 50_000, rates: rates2026 }).fortnightBenefit
    expect(result.employee.paternityTotal).toBe(expectedFortnight)
    expect(result.osvc.paternityTotal).toBe(result.osvc.maternity.dailyBenefit * 14)
  })

  it('returns zero amounts instead of NaN when the employee has no hours', () => {
    const result = compareBenefits({ ...baseInput, workingHoursPerYear: 0 })
    expect(result.employee.salaryCompensation.totalCompensation).toBe(0)
    expect(Number.isNaN(result.employee.sicknessTotal)).toBe(false)
  })

  it('uses the thresholds of the year it is given (2025 differs from 2026)', () => {
    const in2025 = compareBenefits({ ...baseInput, rates: rates2025 })
    const in2026 = compareBenefits(baseInput)
    expect(in2025.hourlyReductionThresholds).toEqual([271.6, 407.4, 814.8])
    expect(in2026.hourlyReductionThresholds).not.toEqual(in2025.hourlyReductionThresholds)
  })
})
