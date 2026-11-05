/**
 * Worked examples and published amounts from state sources (PRD "Value verification", step 5).
 * Each block names its source; the quotes, URLs and the page of each are in
 * docs/legal-research/official-examples.md.
 *
 * `it.fails` marks an official example that the calculator does not reproduce yet. The law wins over the
 * calculator, so the calculator is not changed here; the disagreement is recorded in docs/calc-port-notes.md.
 */
import { describe, expect, it } from 'vitest'
import { buildYearRates, TAX_YEARS } from '../data/tax-years'
import { calculateOsvcSicknessBenefit, calculateSicknessBenefit, osvcMonthlyAssessmentBaseFor } from './benefits'
import { calculateOsvcIncomeTax } from './osvc-income-tax'
import { calculateOsvcSocialInsurance } from './osvc-insurance'
import { calculateOsvcMinimums, calculateOsvcSicknessInsurance, calculatePausalniDanMonthlyAmounts } from './osvc-regimes'

const rates2025 = buildYearRates({ data: TAX_YEARS[2025]! })
const rates2026 = buildYearRates({ data: TAX_YEARS[2026]! })

describe('VZP: minimum OSVČ health advance 2026 (VZP, "Jaký je minimální vyměřovací základ?")', () => {
  it('monthly minimum base 24 483,50 Kč and minimum advance 3 306 Kč', () => {
    expect(TAX_YEARS[2026]!.averageWage).toBe(48_967)
    expect(rates2026.minimums.minimumHealthMonthlyBase).toBe(24_483.5)
    expect(rates2026.minimums.minimumHealthMonthlyPremium).toBe(3_306)
  })
})

describe('ČSSZ: minimum OSVČ social base and advance 2026 (ČSSZ, "Informace pro OSVČ o změně pojistného od 1. 7. 2026")', () => {
  it('before 1 July 2026 the minimum was 40 % of the average wage: 19 587 Kč a month, advance 5 720 Kč', () => {
    const minimums = calculateOsvcMinimums({ averageWage: 48_967, rates: { socialMinimumShare: 0.4 } })
    expect(minimums.minimumSocialMonthlyBase).toBe(19_587)
    expect(minimums.minimumSocialMonthlyPremium).toBe(5_720)
  })

  it('from 1 July 2026 the minimum is 35 % of the average wage: 17 139 Kč a month, advance 5 005 Kč', () => {
    expect(rates2026.minimums.minimumSocialMonthlyBase).toBe(17_139)
    expect(rates2026.minimums.minimumSocialMonthlyPremium).toBe(5_005)
  })

  it('the lower minimum saves 8 577 Kč of pension premium over a full year of 2026', () => {
    const premiumAt40 = calculateOsvcSocialInsurance({
      income: 0,
      expenses: 0,
      rates: { profitShare: 0.55, minimumAssessmentBase: 19_587 * 12, maximumAssessmentBase: 2_350_416 },
    }).premium
    const premiumAt35 = calculateOsvcSocialInsurance({
      income: 0,
      expenses: 0,
      rates: { profitShare: 0.55, minimumAssessmentBase: rates2026.plan.socialInsurance.minimumAssessmentBase, maximumAssessmentBase: 2_350_416 },
    }).premium
    expect(premiumAt40 - premiumAt35).toBe(8_577)
  })

  it('the maximum yearly SP base for 2026 is 48 × the average wage: 2 350 416 Kč', () => {
    expect(rates2026.plan.socialInsurance.maximumAssessmentBase).toBe(2_350_416)
  })
})

describe('ČSSZ: voluntary OSVČ sickness insurance 2026 (ČSSZ, "Výše a výpočet dávek", table at 2,7 %)', () => {
  it.each([
    [9_000, 243],
    [19_710, 533],
    [24_484, 662],
    [28_050, 758],
    [42_900, 1_159],
  ])('a monthly base of %i Kč pays %i Kč a month', (monthlyAssessmentBase, monthlyPremium) => {
    expect(
      calculateOsvcSicknessInsurance({ monthlyAssessmentBase, rates: rates2026.sicknessInsurance }).monthlyPremium,
    ).toBe(monthlyPremium)
  })

  it('the minimum base is 9 000 Kč, twice the 4 500 Kč threshold', () => {
    expect(
      calculateOsvcSicknessInsurance({ rates: rates2026.sicknessInsurance }).minimumMonthlyAssessmentBase,
    ).toBe(9_000)
  })
})

describe('ČSSZ: sickness benefit reduction thresholds 2026 (ČSSZ, "Výše a výpočet dávek")', () => {
  it('first, second and third reduction thresholds are 1 633, 2 449 and 4 897 Kč', () => {
    expect(TAX_YEARS[2026]!.reductionThresholds).toEqual([1_633, 2_449, 4_897])
  })
})

describe('ČSSZ: sickness benefit, Příklad č. 2 (OSVČ, 2026, twelve months of base 16 296 Kč)', () => {
  it('daily base 535,76 Kč, reduced to 483 Kč, daily benefit 290 / 319 / 348 Kč', () => {
    const result = calculateSicknessBenefit({ monthlyAssessmentBase: 16_296, benefitDays: 60, rates: rates2026.benefits })
    expect(result.dailyAssessmentBase).toBe(535.76)
    expect(result.reducedFirstBand).toBe(482.18)
    expect(result.reducedDailyBase).toBe(483)
    expect(result.dailyBenefitDays15To30).toBe(290)
    expect(result.dailyBenefitDays31To60).toBe(319)
    expect(result.dailyBenefitFrom61).toBe(348)
  })

  it.fails('the monthly premium of 440 Kč implies the base 16 296 Kč, as the example states', () => {
    // The calculator takes the smallest base whose premium is ceil(base × 2,7 %) = 440 Kč, i.e. 16 297 Kč,
    // which pays 441 Kč. The example's base is 16 296 Kč (the largest base that still pays 440 Kč).
    expect(osvcMonthlyAssessmentBaseFor({ monthlySicknessPremium: 440, rates: rates2026.benefits })).toBe(16_296)
  })
})

describe('ČSSZ: sickness benefit, Příklad č. 1 and č. 3 (OSVČ, 2026, base for four months only)', () => {
  // The examples divide the bases of four insured months by the 120 days of insurance in the reference period.
  // The calculator takes twelve monthly bases over 365 days, so partial participation is not modelled yet.
  it.fails('Příklad č. 3: 4 × 24 484 Kč over 120 days is a daily base of 816,13 Kč, reduced to 735 Kč', () => {
    const result = calculateSicknessBenefit({ monthlyAssessmentBase: 24_484, benefitDays: 60, rates: rates2026.benefits })
    expect(result.dailyAssessmentBase).toBe(816.13)
    expect(result.reducedDailyBase).toBe(735)
    expect(result.dailyBenefitDays15To30).toBe(441)
    expect(result.dailyBenefitDays31To60).toBe(486)
    expect(result.dailyBenefitFrom61).toBe(530)
  })

  it.fails('Příklad č. 1: 4 × 9 000 Kč over 120 days is a daily base of 300 Kč, reduced to 270 Kč', () => {
    const result = calculateSicknessBenefit({ monthlyAssessmentBase: 9_000, benefitDays: 60, rates: rates2026.benefits })
    expect(result.dailyAssessmentBase).toBe(300)
    expect(result.reducedFirstBand).toBe(270)
    expect(result.dailyBenefitDays15To30).toBe(162)
    expect(result.dailyBenefitDays31To60).toBe(179)
    expect(result.dailyBenefitFrom61).toBe(195)
  })
})

describe('Finanční správa: paušální daň monthly amounts (Informace k institutu paušální daně pro rok 2025 a 2026)', () => {
  it('2025: 8 716, 16 745 and 27 139 Kč a month, and the calculator reproduces them', () => {
    expect(rates2025.pausalniDanMonthly).toEqual([8_716, 16_745, 27_139])
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({
      averageWage: TAX_YEARS[2025]!.averageWage,
      rates: { socialMinimumShare: TAX_YEARS[2025]!.socialMinimumShare },
    })
    expect(monthlyAmounts).toEqual([8_716, 16_745, 27_139])
  })

  it('2025 published parts add up: band 1 = 100 + 5 473 + 3 143, band 2 = 4 963 + 8 191 + 3 591, band 3 = 9 320 + 12 527 + 5 292', () => {
    expect(100 + 5_473 + 3_143).toBe(8_716)
    expect(4_963 + 8_191 + 3_591).toBe(16_745)
    expect(9_320 + 12_527 + 5_292).toBe(27_139)
  })

  it('2026: 9 162, 16 745 and 27 139 Kč a month, and the calculator reproduces them', () => {
    expect(rates2026.pausalniDanMonthly).toEqual([9_162, 16_745, 27_139])
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({
      averageWage: TAX_YEARS[2026]!.averageWage,
      rates: { socialMinimumShare: TAX_YEARS[2026]!.socialMinimumShare },
    })
    expect(monthlyAmounts).toEqual([9_162, 16_745, 27_139])
  })

  it('2026 published parts add up: band 1 = 100 + 5 756 + 3 306 = 9 162 Kč', () => {
    expect(100 + 5_756 + 3_306).toBe(9_162)
  })

  it('before 1 July 2026 band 1 was 9 984 Kč, with the SP minimum at 40 % of the average wage', () => {
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({
      averageWage: 48_967,
      rates: { socialMinimumShare: 0.4 },
    })
    expect(monthlyAmounts[0]).toBe(9_984)
  })

  it('the July 2026 correction: 822 Kč a month for six months is the 4 932 Kč overpayment, leaving 4 230 Kč of 9 162 Kč', () => {
    expect((9_984 - 9_162) * 6).toBe(4_932)
    expect(9_162 - 4_932).toBe(4_230)
  })
})

describe('Finanční správa: Pokyny k vyplnění přiznání k dani z příjmů FO 2025 (ř. 56, 57, 64–68, 72, 76)', () => {
  it('credits: payer 30 840, spouse 24 840, disability 2 520 and 5 040, ZTP/P 16 140 Kč a year', () => {
    expect(rates2025.plan.incomeTax.payerCredit).toBe(30_840)
    expect(rates2025.plan.incomeTax.spouseCredit).toBe(24_840)
    expect(rates2025.plan.incomeTax.disabilityDegree1or2Credit).toBe(2_520)
    expect(rates2025.plan.incomeTax.disabilityDegree3Credit).toBe(5_040)
    expect(rates2025.plan.incomeTax.ztpHolderCredit).toBe(16_140)
  })

  it('child credit 1 267, 1 860 and 2 320 Kč a month: 15 204, 22 320 and 27 840 Kč a year', () => {
    expect(TAX_YEARS[2025]!.incomeTax.childCreditsMonthly).toEqual({ first: 1_267, second: 1_860, thirdAndMore: 2_320 })
    expect(1_267 * 12).toBe(15_204)
    expect(1_860 * 12).toBe(22_320)
    expect(2_320 * 12).toBe(27_840)
  })

  it('a child with a ZTP/P card doubles the child credit (§ 35c odst. 7; instructions ř. 72)', () => {
    const result = calculateOsvcIncomeTax({
      profit: 500_000,
      childrenDetail: [{ months: 12, hasZtpP: true }],
      rates: rates2025.plan.incomeTax,
    })
    expect(result.childCredit).toBe(2 * 15_204)
  })

  it('the bonus is paid only from 100 Kč (ř. 76)', () => {
    expect(TAX_YEARS[2025]!.incomeTax.minimumChildBonus).toBe(100)
  })

  it('the 23 % rate starts above 36 × the average wage: 1 676 052 Kč in 2025 (ř. 57)', () => {
    expect(rates2025.plan.incomeTax.solidarityThreshold).toBe(1_676_052)
  })

  it('the tax base is rounded down to whole hundreds: 93 295 Kč becomes 93 200 Kč (ř. 56)', () => {
    const result = calculateOsvcIncomeTax({ profit: 93_295, rates: rates2025.plan.incomeTax })
    expect(result.taxBase).toBe(93_200)
  })
})
