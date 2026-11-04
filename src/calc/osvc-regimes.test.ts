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
  it('follows § 6 odst. 2 year by year: 4 000 Kč in 2024, 4 500 Kč in 2025 and 2026 (ČSSZ publishes the same)', () => {
    // a tenth of each year's average wage (nařízení vlády 286/2023, 282/2024, 365/2025 Sb.) rounded down to 500 Kč
    expect(sicknessEligibilityThresholdFor({ averageWage: 43_967, previousThreshold: 4_000 })).toBe(4_000)
    expect(sicknessEligibilityThresholdFor({ averageWage: 46_557, previousThreshold: 4_000 })).toBe(4_500)
    expect(sicknessEligibilityThresholdFor({ averageWage: 48_967, previousThreshold: 4_500 })).toBe(4_500)
  })

  it('raises the threshold to a tenth of the average wage rounded down to 500 Kč (rule only, no published year)', () => {
    expect(sicknessEligibilityThresholdFor({ averageWage: 54_999, previousThreshold: 4_500 })).toBe(5_000)
    expect(sicknessEligibilityThresholdFor({ averageWage: 55_000, previousThreshold: 4_500 })).toBe(5_500)
  })

  it('gives the published minimum OSVČ sickness premiums: 216 Kč in 2024, 243 Kč in 2026 (ČSSZ)', () => {
    const premiumFor = (employeeEligibilityThreshold: number) =>
      calculateOsvcSicknessInsurance({ rates: { sicknessInsuranceRatePercent: 2.7, employeeEligibilityThreshold } })
        .monthlyPremium
    expect(premiumFor(4_000)).toBe(216)
    expect(premiumFor(4_500)).toBe(243)
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
  // Every expected number is published by the agencies (2027 is not published yet, so it is not asserted):
  // ZP monthly base and advance: VZP; SP yearly minimums and new-OSVČ minimums: ČSSZ (2026 at 35 % after the
  // July 2026 change: 17 139 Kč a month, advance 5 005 Kč); paušální daň: Finanční správa.
  const years = [
    {
      year: 2024, averageWage: 43_967, socialMinimumShare: 0.3,
      healthMonthlyBase: 21_983.5, healthMonthlyPremium: 2_968, socialYearly: 158_292, newOsvcSocialYearly: 131_904,
      pausalniDan: [7_498, 16_745, 27_139],
    },
    {
      year: 2025, averageWage: 46_557, socialMinimumShare: 0.35,
      healthMonthlyBase: 23_278.5, healthMonthlyPremium: 3_143, socialYearly: 195_540, newOsvcSocialYearly: 139_680,
      pausalniDan: [8_716, 16_745, 27_139],
    },
    {
      year: 2026, averageWage: 48_967, socialMinimumShare: 0.35,
      healthMonthlyBase: 24_483.5, healthMonthlyPremium: 3_306, socialYearly: 205_668, newOsvcSocialYearly: 146_904,
      pausalniDan: [9_162, 16_745, 27_139],
    },
  ]
  const ratesFor = (row: (typeof years)[number]) => ({ socialMinimumShare: row.socialMinimumShare, newOsvcSocialMinimumShare: 0.25 })

  it.each(years)('$year: ZP minimum $healthMonthlyBase Kč a month, advance $healthMonthlyPremium Kč (VZP)', (row) => {
    const result = calculateOsvcMinimums({ averageWage: row.averageWage, rates: ratesFor(row) })
    expect(result.minimumHealthMonthlyBase).toBe(row.healthMonthlyBase)
    expect(result.minimumHealthMonthlyPremium).toBe(row.healthMonthlyPremium)
    expect(result.minimumHealthYearlyBase).toBe(row.healthMonthlyBase * 12)
  })

  it.each(years)('$year: SP minimum $socialYearly Kč a year, new OSVČ $newOsvcSocialYearly Kč (ČSSZ)', (row) => {
    expect(calculateOsvcMinimums({ averageWage: row.averageWage, rates: ratesFor(row) }).minimumSocialYearlyBase).toBe(
      row.socialYearly,
    )
    expect(
      calculateOsvcMinimums({ averageWage: row.averageWage, isNewOsvc: true, rates: ratesFor(row) }).minimumSocialYearlyBase,
    ).toBe(row.newOsvcSocialYearly)
  })

  it.each(years)('$year: paušální daň $pausalniDan Kč a month (Finanční správa)', (row) => {
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({ averageWage: row.averageWage, rates: ratesFor(row) })
    expect(monthlyAmounts).toEqual(row.pausalniDan)
  })

  it('returns the 2026 minimum SP advance of 5 005 Kč (ČSSZ, from July 2026)', () => {
    expect(calculateOsvcMinimums({ averageWage: 48_967, rates: { socialMinimumShare: 0.35 } }).minimumSocialMonthlyPremium).toBe(5_005)
  })

  it('gives the published 2024 minimum SP advance (3 852 Kč) and maximum bases 2024–2025 (ČSSZ, MPSV)', () => {
    expect(calculateOsvcMinimums({ averageWage: 43_967, rates: { socialMinimumShare: 0.3 } })).toMatchObject({
      minimumSocialMonthlyBase: 13_191,
      minimumSocialMonthlyPremium: 3_852,
      maximumSocialYearlyBase: 2_110_416,
    })
    expect(calculateOsvcMinimums({ averageWage: 46_557, rates: { socialMinimumShare: 0.35 } }).maximumSocialYearlyBase).toBe(
      2_234_736,
    )
  })

  it('derives the solidarity threshold and the maximum SP base from the average wage (§ 16; § 15a)', () => {
    const result = calculateOsvcMinimums({ averageWage: 48_967, rates: { socialMinimumShare: 0.35 } })
    expect(result.solidarityThreshold).toBe(1_762_812)
    expect(result.maximumSocialYearlyBase).toBe(2_350_416)
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

describe('2027 from the acts as they read from 1 January 2027 (e-Sbírka) and nařízení vlády 177/2026 Sb.', () => {
  // average wage 51 663 Kč; 589/1992 § 14 odst. 5 (35 %, new OSVČ 25 %), § 14 odst. 13 and § 7 odst. 3 (round up),
  // § 15a (48 ×); 592/1992 § 3a (50 %); 586/1992 § 16 (36 ×), § 38lk odst. 7 a 8, § 2b
  const rates2027 = { socialMinimumShare: 0.35, newOsvcSocialMinimumShare: 0.25 }
  const minimums = calculateOsvcMinimums({ averageWage: 51_663, rates: rates2027 })

  it('derives the ZP and SP minimums, the maximum SP base and the 23 % threshold', () => {
    expect(minimums).toMatchObject({
      minimumHealthMonthlyBase: 25_831.5,
      minimumHealthYearlyBase: 309_978,
      minimumHealthMonthlyPremium: 3_488,
      minimumSocialMonthlyBase: 18_083,
      minimumSocialYearlyBase: 216_996,
      minimumSocialMonthlyPremium: 5_281,
      maximumSocialYearlyBase: 2_479_824,
      solidarityThreshold: 1_859_868,
    })
    const newOsvc = calculateOsvcMinimums({ averageWage: 51_663, isNewOsvc: true, rates: rates2027 })
    expect([newOsvc.minimumSocialMonthlyBase, newOsvc.minimumSocialMonthlyPremium]).toEqual([12_916, 3_772])
  })

  it('derives the paušální daň: band 1 rounds the raised base up before the premium (9 661 Kč)', () => {
    expect(calculatePausalniDanMonthlyAmounts({ averageWage: 51_663, rates: rates2027 }).monthlyAmounts).toEqual([
      9_661, 16_745, 27_139,
    ])
  })

  it('adds the 1 400 Kč surcharge to band 1 for taxpayers who opt out of sales registration (§ 2b, § 38lk odst. 8)', () => {
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({
      averageWage: 51_663,
      withSalesRegistrationSurcharge: true,
      rates: { ...rates2027, salesRegistrationSurcharge: 1_400 },
    })
    expect(monthlyAmounts).toEqual([11_061, 16_745, 27_139])
  })

  it('derives the sickness eligibility threshold (5 000 Kč) and the OSVČ minimum sickness premium (270 Kč)', () => {
    const threshold = sicknessEligibilityThresholdFor({ averageWage: 51_663, previousThreshold: 4_500 })
    expect(threshold).toBe(5_000)
    expect(
      calculateOsvcSicknessInsurance({ rates: { sicknessInsuranceRatePercent: 2.7, employeeEligibilityThreshold: threshold } })
        .monthlyPremium,
    ).toBe(270)
  })
})
