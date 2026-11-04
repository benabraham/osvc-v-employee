import { describe, expect, it } from 'vitest'
import {
  averageWageFor,
  calculateFlatRateExpenses,
  calculateOsvcMinimums,
  calculatePausalniDanMonthlyAmounts,
  calculateOsvcSicknessInsurance,
  calculatePausalniDan,
  isNewOsvcFor,
  pausalniDanBandFor,
  sicknessEligibilityThresholdFor,
} from './osvc-regimes'

describe('flat-rate expenses (zákon 586/1992 Sb. § 7 odst. 7)', () => {
  it.each([
    [695_500, 0.6, 417_300],
    [2_500_000, 0.6, 1_200_000],
    [2_500_000, 0.8, 1_600_000],
    [1_000_000, 0.4, 400_000],
    [3_000_000, 0.4, 800_000],
    [2_100_000, 0.3, 600_000],
  ] as const)('income %d at %d gives %d', (income, expenseRate, expected) => {
    expect(calculateFlatRateExpenses({ income, expenseRate }).expenses).toBe(expected)
  })

  it('reports the cap for the rate', () => {
    expect(calculateFlatRateExpenses({ income: 100_000, expenseRate: 0.8 }).cap).toBe(1_600_000)
  })
})

describe('paušální daň bands (§ 2a odst. 5)', () => {
  it.each([
    [{ income: 900_000 }, 1],
    [{ income: 1_200_000, shareAt60Or80Percent: 0.8 }, 1],
    [{ income: 1_200_000, shareAt60Or80Percent: 0.7 }, 2],
    [{ income: 1_800_000, shareAt80Percent: 0.75 }, 1],
    [{ income: 1_800_000, shareAt60Or80Percent: 0.75 }, 2],
    [{ income: 1_800_000 }, 3],
    [{ income: 2_000_000 }, 3],
    [{ income: 2_000_001 }, null],
  ] as const)('%o fits band %s', (input, band) => {
    expect(pausalniDanBandFor(input).band).toBe(band)
  })

  it('counts 80 % income towards the 60-or-80 % share', () => {
    expect(pausalniDanBandFor({ income: 1_400_000, shareAt80Percent: 0.8 }).band).toBe(1)
  })

  it('turns the monthly amount of a band into a yearly total', () => {
    // 2026 band 1 after the July 2026 change and band 2, as in the PRD constants table
    const rates = { monthlyAmounts: [9_162, 16_745, 27_139] as [number, number, number] }
    expect(calculatePausalniDan({ band: 1, rates })).toEqual({ band: 1, monthlyAmount: 9_162, yearlyAmount: 109_944 })
    expect(calculatePausalniDan({ band: 2, rates }).yearlyAmount).toBe(200_940)
  })
})

describe('OSVČ voluntary sickness insurance (zákon 589/1992 Sb. § 3, § 5b odst. 4; zákon 187/2006 Sb. § 6 odst. 2)', () => {
  it('raises the eligibility threshold to a tenth of the average wage rounded down to 500 Kč', () => {
    expect(sicknessEligibilityThresholdFor({ averageWage: 48_967, previousThreshold: 4_500 })).toBe(4_500)
    expect(sicknessEligibilityThresholdFor({ averageWage: 51_663, previousThreshold: 4_500 })).toBe(5_000)
  })

  it('never lowers the threshold', () => {
    expect(sicknessEligibilityThresholdFor({ averageWage: 30_000, previousThreshold: 4_500 })).toBe(4_500)
  })

  const rates = { sicknessInsuranceRatePercent: 2.7, employeeEligibilityThreshold: 4_500 }

  it('uses twice the eligibility threshold as the minimum monthly base', () => {
    expect(calculateOsvcSicknessInsurance({ rates })).toEqual({
      minimumMonthlyAssessmentBase: 9_000,
      monthlyAssessmentBase: 9_000,
      monthlyPremium: 243,
      yearlyPremium: 2_916,
    })
  })

  it('takes a chosen higher base and rounds the premium up', () => {
    expect(calculateOsvcSicknessInsurance({ monthlyAssessmentBase: 20_000, rates }).monthlyPremium).toBe(540)
    expect(calculateOsvcSicknessInsurance({ monthlyAssessmentBase: 12_345, rates }).monthlyPremium).toBe(334)
  })

  it('lifts a chosen base below the minimum and caps it at the maximum', () => {
    expect(calculateOsvcSicknessInsurance({ monthlyAssessmentBase: 5_000, rates }).monthlyAssessmentBase).toBe(9_000)
    expect(
      calculateOsvcSicknessInsurance({ monthlyAssessmentBase: 90_000, maximumMonthlyAssessmentBase: 40_000, rates })
        .monthlyAssessmentBase,
    ).toBe(40_000)
  })
})

describe('OSVČ yearly minimums from the average wage (zákon 592/1992 Sb. § 3a odst. 2; zákon 589/1992 Sb. § 14 odst. 5, § 15a)', () => {
  // average wage and minimum SP share per year, as in the PRD constants table
  const years = [
    { year: 2024, averageWage: 43_967, socialMinimumShare: 0.3, healthYearly: 263_802, socialYearly: 158_292, band1: 7_498 },
    { year: 2025, averageWage: 46_557, socialMinimumShare: 0.35, healthYearly: 279_342, socialYearly: 195_540, band1: 8_716 },
    { year: 2026, averageWage: 48_967, socialMinimumShare: 0.35, healthYearly: 293_802, socialYearly: 205_668, band1: 9_162 },
    { year: 2027, averageWage: 51_663, socialMinimumShare: 0.35, healthYearly: 309_978, socialYearly: 216_996, band1: 9_662 },
  ]

  it.each(years)('$year: minimum bases, solidarity threshold and maximum SP base', (row) => {
    const result = calculateOsvcMinimums({ averageWage: row.averageWage, rates: { socialMinimumShare: row.socialMinimumShare } })
    expect(result.minimumHealthYearlyBase).toBe(row.healthYearly)
    expect(result.minimumSocialYearlyBase).toBe(row.socialYearly)
    expect(result.solidarityThreshold).toBe(36 * row.averageWage)
    expect(result.maximumSocialYearlyBase).toBe(48 * row.averageWage)
  })

  it.each(years)('$year: band 1 paušální daň is $band1 Kč a month', (row) => {
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({
      averageWage: row.averageWage,
      rates: { socialMinimumShare: row.socialMinimumShare },
    })
    expect(monthlyAmounts[0]).toBe(row.band1)
  })

  it('builds bands 2 and 3 from the fixed bases in the acts (2026: 16 745 and 27 139 Kč)', () => {
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({ averageWage: 48_967, rates: { socialMinimumShare: 0.35 } })
    expect(monthlyAmounts).toEqual([9_162, 16_745, 27_139])
  })

  it('returns the 2026 minimum monthly premiums (ZP 3 306 Kč, SP 5 005 Kč)', () => {
    const result = calculateOsvcMinimums({ averageWage: 48_967, rates: { socialMinimumShare: 0.35 } })
    expect(result.minimumHealthMonthlyPremium).toBe(3_306)
    expect(result.minimumSocialMonthlyPremium).toBe(5_005)
  })
})

describe('average wage for insurance purposes (zákon 155/1995 Sb.; nařízení vlády 365/2025 Sb. and 177/2026 Sb.)', () => {
  it.each([
    [40_638, 1.0819, 43_967],
    [43_682, 1.0658, 46_557],
    [46_278, 1.0581, 48_967],
    [48_900, 1.0565, 51_663],
  ])('general base %d × coefficient %d rounds up to %d', (generalAssessmentBase, conversionCoefficient, expected) => {
    expect(averageWageFor({ generalAssessmentBase, conversionCoefficient })).toBe(expected)
  })
})

describe('new OSVČ minimum SP base (zákon 589/1992 Sb. § 14 odst. 5)', () => {
  const rates = { socialMinimumShare: 0.35, newOsvcSocialMinimumShare: 0.25 }

  it('uses 25 % of the average wage in the start year and the next two (ČSSZ 2026: 12 242 Kč, advance 3 575 Kč)', () => {
    const result = calculateOsvcMinimums({ averageWage: 48_967, isNewOsvc: true, rates })
    expect(result.minimumSocialMonthlyBase).toBe(12_242)
    expect(result.minimumSocialMonthlyPremium).toBe(3_575)
  })

  it('keeps 35 % for everyone else', () => {
    expect(calculateOsvcMinimums({ averageWage: 48_967, rates }).minimumSocialMonthlyBase).toBe(17_139)
  })

  it.each([
    [{ year: 2026, startYear: 2024 }, true],
    [{ year: 2027, startYear: 2024 }, false],
    [{ year: 2026, startYear: 2026, wasOsvcInPrevious20Years: true }, false],
  ] as const)('%o is a new OSVČ: %s', (input, expected) => {
    expect(isNewOsvcFor(input)).toBe(expected)
  })
})
