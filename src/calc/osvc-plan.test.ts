import { describe, expect, it } from 'vitest'
import { calculateOsvcMinimums } from './osvc-regimes'
import { calculateOsvcPlan } from './osvc-plan'

// 2026 rates built from the average wage (48 967 Kč) and the minimum wage (22 400 Kč)
const minimums2026 = calculateOsvcMinimums({ averageWage: 48_967, rates: { socialMinimumShare: 0.35 } })
const rates2026 = {
  incomeTax: {
    baseTaxRate: 0.15,
    solidarityTaxRate: 0.23,
    solidarityThreshold: minimums2026.solidarityThreshold,
    payerCredit: 30_840,
    spouseCredit: 24_840,
    disabilityDegree1or2Credit: 2_520,
    disabilityDegree3Credit: 5_040,
    ztpHolderCredit: 16_140,
    childCreditsMonthly: { first: 1_267, second: 1_860, thirdAndMore: 2_320 },
    mortgageInterestCap: 150_000,
    mortgageInterestPre2021Cap: 300_000,
    retirementProductsCap: 48_000,
    donationsMinimumShare: 0.02,
    donationsMinimumAmount: 1_000,
    donationsMaximumShare: 0.15,
    minimumWage: 22_400,
    minimumChildBonus: 100,
  },
  healthInsurance: { minimumAssessmentBase: minimums2026.minimumHealthYearlyBase },
  socialInsurance: {
    profitShare: 0.55,
    minimumAssessmentBase: minimums2026.minimumSocialYearlyBase,
    maximumAssessmentBase: minimums2026.maximumSocialYearlyBase,
  },
}

const defaults2026 = {
  workingDays: 250,
  vacationDays: 20,
  hoursPerDay: 5,
  nonBillableHoursPerYear: 80,
  hourlyRate: 650,
  expenseRate: 0.6 as const,
  costsPerYear: 47_000,
  reserveMonths: 1.5,
  invoiceAmount: 10_000,
  rates: rates2026,
}

describe('calculateOsvcPlan: PRD parity fixture for 2026 defaults', () => {
  const plan = calculateOsvcPlan(defaults2026)

  it.each([
    ['invoiced', 695_500],
    ['taxDeductibleCosts', 417_300],
    ['taxBase', 278_200],
    ['incomeTax', 10_890],
    ['healthInsurance', 39_664],
    ['socialInsurance', 60_056],
    ['totalLevies', 110_610],
    ['afterTax', 584_890],
    ['afterTaxAndCosts', 537_890],
    ['reservePerYear', 61_120],
    ['holidayPerYear', 38_200],
    ['netYearly', 477_000],
    ['netMonthly', 39_700],
    ['perDay', 1_910],
  ] as const)('%s is %d Kč', (key, expected) => {
    expect(plan[key]).toBe(expected)
  })

  it('splits a 10 000 Kč invoice into 1 600 / 700 / 900 / 500 / 6 300', () => {
    expect(plan.invoiceSplit).toEqual({ levies: 1_600, costs: 700, reserve: 900, holiday: 500, spend: 6_300 })
  })
})

describe('calculateOsvcPlan: edge cases from the PRD', () => {
  it('uses the 55 % SP share at 1 000 Kč/h (SP 68 737 Kč, net 65 100 Kč a month)', () => {
    const plan = calculateOsvcPlan({ ...defaults2026, hourlyRate: 1_000 })
    expect(plan.socialInsurance).toBe(68_737)
    expect(plan.netMonthly).toBe(65_100)
  })

  it('replaces ZP, SP and income tax with the paušální daň when chosen', () => {
    const plan = calculateOsvcPlan({ ...defaults2026, pausalniDanMonthly: 9_162 })
    expect(plan.totalLevies).toBe(109_944)
  })

  it('adds voluntary sickness insurance to the levies', () => {
    const plan = calculateOsvcPlan({ ...defaults2026, sicknessInsurancePerYear: 2_916 })
    expect(plan.totalLevies).toBe(110_610 + 2_916)
  })

  it('honours overrides of the tax-deductible costs and the total levies', () => {
    expect(calculateOsvcPlan({ ...defaults2026, taxDeductibleCostsOverride: 300_000 }).taxBase).toBe(395_500)
    expect(calculateOsvcPlan({ ...defaults2026, totalLeviesOverride: 100_000 }).afterTax).toBe(595_500)
  })
})
