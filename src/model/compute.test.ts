import { describe, expect, it } from 'vitest'
import { TAX_YEARS } from '../data/tax-years'
import { computeResults } from './compute'
import { defaultInputs, type Inputs } from './inputs'

/** The inputs of one test: the defaults with some fields changed. */
const withInputs = (changes: Partial<Inputs>): Inputs => ({ ...defaultInputs(), ...changes })
const resultsFor = (year: number, changes: Partial<Inputs> = {}) =>
  computeResults({ inputs: withInputs(changes), data: TAX_YEARS[year]! })

/** The figures the PRD tables compare, flat so a failing test shows every number at once. */
const summaryFor = (results: ReturnType<typeof resultsFor>) => ({
  invoiced: results.plan.invoiced,
  incomeTax: results.plan.incomeTax,
  healthInsurance: results.plan.healthInsurance,
  socialInsurance: results.plan.socialInsurance,
  totalLevies: results.plan.totalLevies,
  netMonthly: results.plan.netMonthly,
  grossWage: results.grossEquivalent.grossWage,
  split: [
    results.plan.invoiceSplit.levies,
    results.plan.invoiceSplit.costs,
    results.plan.invoiceSplit.reserve,
    results.plan.invoiceSplit.holiday,
    results.plan.invoiceSplit.spend,
  ],
})

describe('computeResults: PRD parity fixture for 2026 defaults', () => {
  const results = resultsFor(2026)

  it('reproduces every output of the PRD table', () => {
    expect(results.workingDays).toBe(250)
    expect(results.costsPerYear).toBe(47_000)
    expect(results.plan).toMatchObject({
      invoiced: 695_500,
      taxDeductibleCosts: 417_300,
      taxBase: 278_200,
      incomeTax: 10_890,
      healthInsurance: 39_664,
      socialInsurance: 60_056,
      totalLevies: 110_610,
      afterTax: 584_890,
      afterTaxAndCosts: 537_890,
      reservePerYear: 61_120,
      holidayPerYear: 38_200,
      netYearly: 477_000,
      netMonthly: 39_700,
      perDay: 1_910,
    })
    expect(results.plan.invoiceSplit).toEqual({ levies: 1_600, costs: 700, reserve: 900, holiday: 500, spend: 6_300 })
  })

  it('gives the gross salary equivalent of 50 589 Kč (sheet estimate 50 600)', () => {
    expect(results.grossEquivalent.grossWage).toBe(50_589)
    expect(results.grossEquivalent.netWage).toBeGreaterThanOrEqual(39_700)
  })

  it('shows paušální daň saving 666 Kč a year: 110 610 regular against 109 944 flat', () => {
    expect(results.pausalniDanHint).toEqual({
      isAvailable: true,
      band: 1,
      yearlyPausalniDan: 109_944,
      yearlyRegular: 110_610,
      yearlySaving: 666,
    })
  })

  it('shows the levies as 15.9 % of the invoiced amount', () => {
    expect(results.percentages.levies).toBeCloseTo(0.159, 3)
  })

  it('has no warnings and no unverified values', () => {
    expect(results.warnings).toEqual([])
    expect(results.unverifiedValues).toEqual([])
  })
})

describe('computeResults: the four tax years of the PRD table', () => {
  const yearCases = [
    {
      year: 2024,
      changes: { hourlyRate: 700, workingDays: 252 },
      expected: {
        invoiced: 756_000,
        incomeTax: 14_520,
        healthInsurance: 35_614,
        socialInsurance: 48_566,
        totalLevies: 98_700,
        netMonthly: 45_100,
        grossWage: 57_953,
        split: [1_300, 600, 900, 600, 6_600],
      },
    },
    {
      year: 2025,
      changes: { hourlyRate: 700, workingDays: 251 },
      expected: {
        invoiced: 752_500,
        incomeTax: 14_310,
        healthInsurance: 37_712,
        socialInsurance: 57_098,
        totalLevies: 109_120,
        netMonthly: 44_100,
        grossWage: 56_585,
        split: [1_500, 600, 900, 600, 6_400],
      },
    },
    {
      year: 2026,
      changes: { hourlyRate: 650, workingDays: 250 },
      expected: {
        invoiced: 695_500,
        incomeTax: 10_890,
        healthInsurance: 39_664,
        socialInsurance: 60_056,
        totalLevies: 110_610,
        netMonthly: 39_700,
        grossWage: 50_589,
        split: [1_600, 700, 900, 500, 6_300],
      },
    },
    {
      year: 2027,
      changes: { hourlyRate: 650, workingDays: 252 },
      expected: {
        invoiced: 702_000,
        incomeTax: 11_280,
        healthInsurance: 41_848,
        socialInsurance: 63_363,
        totalLevies: 116_491,
        netMonthly: 39_800,
        grossWage: 50_737,
        split: [1_700, 700, 900, 500, 6_200],
      },
    },
  ]

  it.each(yearCases)('$year matches the PRD column', ({ year, changes, expected }) => {
    expect(summaryFor(resultsFor(year, changes))).toEqual(expected)
  })
})

describe('computeResults: edge cases from the PRD', () => {
  it('2026 at 1 000 Kč an hour: social insurance 68 737 Kč and net 65 100 Kč a month, not the sheet 81 235 Kč and 64 200 Kč', () => {
    const results = resultsFor(2026, { hourlyRate: 1_000 })
    expect(results.plan.socialInsurance).toBe(68_737)
    expect(results.plan.netMonthly).toBe(65_100)
  })

  it('applies three children of 12 months each: the child bonus turns the tax negative', () => {
    const child = { months: 12, hasZtpP: false, preschoolFees: 0 }
    const results = resultsFor(2026, { children: [child, child, child] })
    // tax 10 890 is covered by the first credits; 65 364 − 10 890 = 54 474 is paid as the bonus
    expect(results.plan.incomeTaxDetail).toMatchObject({ childCredit: 65_364, childCreditApplied: 10_890, childBonus: 54_474 })
    expect(results.plan.incomeTax).toBe(-54_474)
    expect(results.plan.netMonthly).toBe(44_600)
  })

  it('doubles the child credit of a child with a ZTP/P card: 2 × 1 267 × 12 = 30 408 Kč', () => {
    const results = resultsFor(2026, { children: [{ months: 12, hasZtpP: true, preschoolFees: 0 }] })
    expect(results.plan.incomeTaxDetail.childCredit).toBe(30_408)
    // 10 890 of tax is covered, the other 19 518 Kč is the bonus
    expect(results.plan.incomeTax).toBe(-19_518)
  })

  it('prorates the mortgage interest cap by the months the interest was paid', () => {
    const results = resultsFor(2026, {
      deductions: { ...defaultInputs().deductions, mortgageInterest: 200_000, mortgageMonths: 6 },
    })
    expect(results.plan.incomeTaxDetail.deductibleMortgageInterest).toBe(75_000)
    expect(results.plan.taxBase).toBe(203_200)
  })

  it('adds 3 000 Kč for each unpaid blood donation to the deductible donations', () => {
    const results = resultsFor(2026, { deductions: { ...defaultInputs().deductions, bloodDonations: 2 } })
    expect(results.plan.incomeTaxDetail.deductibleDonations).toBe(6_000)
    expect(results.plan.taxBase).toBe(272_200)
  })

  it('adds 20 000 Kč for each organ donation to the deductible donations', () => {
    const results = resultsFor(2026, { deductions: { ...defaultInputs().deductions, organDonations: 1 } })
    expect(results.plan.incomeTaxDetail.deductibleDonations).toBe(20_000)
  })

  it('rounds the tax base down to whole hundreds (§ 16 odst. 2): profit 278 628 gives 278 600', () => {
    // 1 070 hours × 651 Kč = 696 570; 60 % expenses leave a profit of 278 628
    const results = resultsFor(2026, { hourlyRate: 651 })
    expect(results.plan.invoiced).toBe(696_570)
    expect(results.plan.taxBase).toBe(278_600)
  })

  it('applies the minimum SP base to a new OSVČ: 2026 minimum 146 904 Kč, so a 300 Kč an hour year pays 42 896 Kč', () => {
    const regular = resultsFor(2026, { hourlyRate: 300 })
    const newOsvc = resultsFor(2026, { hourlyRate: 300, isNewOsvc: true })
    expect(regular.plan.socialInsurance).toBe(60_056)
    expect(newOsvc.rates.minimums.minimumSocialYearlyBase).toBe(146_904)
    expect(newOsvc.plan.socialInsurance).toBe(42_896)
  })

  it('keeps the minimum SP base at 205 668 Kč for an established OSVČ', () => {
    expect(resultsFor(2026).rates.minimums.minimumSocialYearlyBase).toBe(205_668)
  })
})

describe('computeResults: expense rates', () => {
  it.each([
    [0.3, 208_650],
    [0.4, 278_200],
    [0.6, 417_300],
    [0.8, 556_400],
  ] as const)('expense rate %s deducts %s Kč of 695 500 Kč invoiced', (expenseRate, taxDeductibleCosts) => {
    expect(resultsFor(2026, { expenseRate }).plan.taxDeductibleCosts).toBe(taxDeductibleCosts)
  })
})

describe('computeResults: paušální daň', () => {
  it('replaces ZP, SP and income tax with 12 × the band 1 amount', () => {
    const results = resultsFor(2026, { usesPausalniDan: true })
    expect(results.plan.totalLevies).toBe(9_162 * 12)
    expect(results.pausalniDan).toMatchObject({ band: 1, monthlyAmount: 9_162, isAvailable: true })
  })

  it('shows the regular levies in the hint, even when paušální daň is on', () => {
    const results = resultsFor(2026, { usesPausalniDan: true })
    expect(results.pausalniDanHint.yearlyRegular).toBe(110_610)
    expect(results.pausalniDanHint.yearlySaving).toBe(666)
  })

  it('moves to band 2 above 1 000 000 Kč when the expense rate is 30 %, but stays in band 1 at 60 %', () => {
    const at30 = resultsFor(2026, { usesPausalniDan: true, expenseRate: 0.3, hourlyRate: 1_000 })
    const at60 = resultsFor(2026, { usesPausalniDan: true, expenseRate: 0.6, hourlyRate: 1_000 })
    expect(at30.pausalniDan.band).toBe(2)
    expect(at30.plan.totalLevies).toBe(16_745 * 12)
    expect(at60.pausalniDan.band).toBe(1)
    expect(at30.warnings).not.toContain('pausalniDanAboveBand')
  })

  it('adds the 1 400 Kč sales registration surcharge to band 1 from 2027 only when chosen', () => {
    const withSurcharge = resultsFor(2027, { usesPausalniDan: true, withSalesRegistrationSurcharge: true })
    const withoutSurcharge = resultsFor(2027, { usesPausalniDan: true })
    expect(withSurcharge.plan.totalLevies).toBe(11_061 * 12)
    expect(withoutSurcharge.plan.totalLevies).toBe(9_661 * 12)
  })

  it('warns when the income is above band 2', () => {
    const band3 = resultsFor(2026, { usesPausalniDan: true, expenseRate: 0.3, hourlyRate: 1_500 })
    const aboveAllBands = resultsFor(2026, { usesPausalniDan: true, expenseRate: 0.3, hourlyRate: 2_000 })
    expect(band3.pausalniDan.isAvailable).toBe(false)
    expect(band3.warnings).toContain('pausalniDanAboveBand')
    expect(aboveAllBands.pausalniDan.band).toBeNull()
    expect(aboveAllBands.warnings).toContain('pausalniDanAboveBand')
  })
})

describe('computeResults: scope and minimum wage warnings', () => {
  it('does not warn about scope between 1 M and 1.5 M Kč invoiced', () => {
    const results = resultsFor(2026, { hourlyRate: 1_000 })
    expect(results.plan.invoiced).toBe(1_070_000)
    expect(results.warnings).not.toContain('aboveScope')
  })

  it('warns above 1.5 M Kč invoiced', () => {
    const results = resultsFor(2026, { hourlyRate: 1_500 })
    expect(results.plan.invoiced).toBe(1_605_000)
    expect(results.warnings).toContain('aboveScope')
  })

  it('warns when the gross salary equivalent is below the minimum wage (150 Kč an hour)', () => {
    const results = resultsFor(2026, { hourlyRate: 150 })
    expect(results.grossEquivalent.grossWage).toBeLessThan(22_400)
    expect(results.warnings).toContain('grossBelowMinimumWage')
  })

  it('warns when a child credit cannot be paid because the bonus test fails', () => {
    const results = resultsFor(2026, { hourlyRate: 120, children: [{ months: 12, hasZtpP: false, preschoolFees: 0 }] })
    expect(results.plan.incomeTaxDetail.isChildBonusEligible).toBe(false)
    expect(results.warnings).toContain('childBonusNotEligible')
  })
})

describe('computeResults: overrides', () => {
  it('uses an overridden tax-deductible cost downstream and leaves the calculated plan unchanged', () => {
    const results = resultsFor(2026, { overrides: { taxDeductibleCosts: 200_000, totalLevies: null } })
    expect(results.plan.taxDeductibleCosts).toBe(200_000)
    expect(results.plan.taxBase).toBe(495_500)
    expect(results.calculatedPlan.taxDeductibleCosts).toBe(417_300)
    expect(results.calculatedPlan.totalLevies).toBe(110_610)
  })

  it('uses an overridden total of levies in the net income and the invoice split', () => {
    const results = resultsFor(2026, { overrides: { taxDeductibleCosts: null, totalLevies: 100_000 } })
    expect(results.plan.totalLevies).toBe(100_000)
    expect(results.plan.netMonthly).toBe(40_500)
    expect(results.calculatedPlan.netMonthly).toBe(39_700)
    expect(results.plan.invoiceSplit.levies).toBe(1_400)
  })
})

describe('computeResults: sickness insurance, expense shares and the rest', () => {
  it('adds the voluntary sickness insurance at the minimum base: 9 000 × 2.7 % × 12 = 2 916 Kč', () => {
    const results = resultsFor(2026, { sicknessInsurance: { enabled: true, monthlyAssessmentBase: null } })
    expect(results.sicknessInsurance).toMatchObject({ enabled: true, yearlyPremium: 2_916 })
    expect(results.plan.totalLevies).toBe(110_610 + 2_916)
  })

  it('counts no sickness insurance when it is switched off', () => {
    const results = resultsFor(2026)
    expect(results.sicknessInsurance).toMatchObject({ enabled: false, yearlyPremium: 0 })
  })

  it('lists the unverified values of a year whose values are researched, not verified', () => {
    expect(resultsFor(2027).unverifiedValues).toContain('pausalniDanMonthly')
  })

  it('uses the year of the data and its working days', () => {
    expect(resultsFor(2025).year).toBe(2025)
    expect(resultsFor(2025).workingDays).toBe(251)
  })
})
