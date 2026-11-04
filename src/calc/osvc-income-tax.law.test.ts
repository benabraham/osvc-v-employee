import { describe, expect, it } from 'vitest'
import type { FixtureRow } from './fixtures/run-fixtures'
import incomeTaxRows from './fixtures/osvc-income-tax.json'
import retirementRows from './fixtures/retirement-products-deduction.json'
import { calculateOsvcIncomeTax, calculateRetirementProductsDeduction } from './osvc-income-tax'

// Rates for tax year 2025 as exported with the fixtures (minimum wage 20 800 Kč).
const rates2025 = (incomeTaxRows as FixtureRow[]).find((row) => row.taxYear === 2025)!.rates as any
const retirementRates = (taxYear: number) =>
  (retirementRows as FixtureRow[]).find((row) => row.taxYear === taxYear)!.rates as any

describe('donations (zákon 586/1992 Sb. § 15 odst. 1)', () => {
  const deductionsFor = (donations: number) =>
    calculateOsvcIncomeTax({ profit: 500_000, donations, rates: rates2025 }).deductionsTotal

  it('ignores donations below both 1 000 Kč and 2 % of the tax base', () => {
    expect(deductionsFor(900)).toBe(0)
  })

  it('counts donations of at least 1 000 Kč even under 2 % of the base', () => {
    expect(deductionsFor(1_000)).toBe(1_000)
    expect(deductionsFor(9_000)).toBe(9_000)
  })

  it('caps donations at 15 % of the tax base', () => {
    expect(deductionsFor(100_000)).toBe(75_000)
  })
})

describe('housing loan interest (§ 15 odst. 3 a 4; zákon 386/2020 Sb. čl. IV)', () => {
  const deductionsFor = (loans: { mortgageInterest?: number; mortgageInterestPre2021?: number }) =>
    calculateOsvcIncomeTax({ profit: 2_000_000, ...loans, rates: rates2025 }).deductionsTotal

  it('caps interest on housing acquired from 2021 at 150 000 Kč', () => {
    expect(deductionsFor({ mortgageInterest: 200_000 })).toBe(150_000)
  })

  it('keeps the 300 000 Kč cap for housing acquired before 2021', () => {
    expect(deductionsFor({ mortgageInterestPre2021: 350_000 })).toBe(300_000)
  })

  it('never deducts more than 300 000 Kč for old and new loans together', () => {
    // Finanční správa example: old loan 300 000 Kč and new loan 150 000 Kč give 300 000 Kč in total
    expect(deductionsFor({ mortgageInterest: 150_000, mortgageInterestPre2021: 300_000 })).toBe(300_000)
    expect(deductionsFor({ mortgageInterest: 100_000, mortgageInterestPre2021: 100_000 })).toBe(200_000)
  })
})

describe('child tax bonus (§ 35c odst. 3 a 4)', () => {
  const twoChildren = { firstChildMonths: 12, secondChildMonths: 12 }

  it('pays the bonus when § 6 and § 7 income reaches 6 × the minimum wage', () => {
    const result = calculateOsvcIncomeTax({ profit: 100_000, qualifyingIncome: 124_800, ...twoChildren, rates: rates2025 })
    expect(result.childBonus).toBe(37_524)
    expect(result.taxTotal).toBe(-37_524)
  })

  it('pays no bonus below 6 × the minimum wage, but the credit still cuts the tax', () => {
    const result = calculateOsvcIncomeTax({ profit: 100_000, qualifyingIncome: 124_799, ...twoChildren, rates: rates2025 })
    expect(result.isChildBonusEligible).toBe(false)
    expect(result.childBonus).toBe(0)
    expect(result.taxTotal).toBe(0)
  })

  it('pays no bonus under 100 Kč', () => {
    // tax 32 070 − payer credit 30 840 = 1 230; one child for one month 1 267 leaves 37 Kč
    const result = calculateOsvcIncomeTax({ profit: 213_800, qualifyingIncome: 500_000, firstChildMonths: 1, rates: rates2025 })
    expect(result.childCreditApplied).toBe(1_230)
    expect(result.childBonus).toBe(0)
    expect(result.taxTotal).toBe(0)
  })
})

describe('retirement products (§ 15 odst. 6 a 7; zákon 427/2011 Sb. § 14)', () => {
  it('deducts only the part of each monthly pension contribution above the maximum state contribution level', () => {
    // 2024: 1 000 Kč a month until June, 1 700 Kč from July; 1 500 Kč a month gives 6 × 500
    const result = calculateRetirementProductsDeduction({ pensionSavingsContributions: 18_000, rates: retirementRates(2024) })
    expect(result.pensionSavingsDeductible).toBe(3_000)
  })

  it('uses 1 700 Kč for every month from 2025', () => {
    const result = calculateRetirementProductsDeduction({ pensionSavingsContributions: 24_000, rates: retirementRates(2025) })
    expect(result.pensionSavingsDeductible).toBe(3_600)
  })

  it('includes long-term care insurance in the combined 48 000 Kč cap', () => {
    const result = calculateRetirementProductsDeduction({
      lifeInsurancePremiums: 30_000,
      longTermCareInsurancePremiums: 30_000,
      rates: retirementRates(2025),
    })
    expect(result.longTermCareInsuranceDeductible).toBe(30_000)
    expect(result.deduction).toBe(48_000)
  })
})

describe('credits from 2027 (zákon 180/2026 Sb., new § 35bc–35be)', () => {
  // 2027 minimum wage 24 900 Kč (MPSV); the new credits exist only in rates for 2027 onwards
  const rates2027 = {
    ...rates2025,
    minimumWage: 24_900,
    studentCredit: 4_020,
    childPlacementCreditCapIsMinimumWage: true,
    salesRegistrationCredit: 5_000,
  }

  it('gives the student credit of 4 020 Kč, one twelfth for each month (§ 35bc, § 35ba odst. 3)', () => {
    expect(calculateOsvcIncomeTax({ profit: 400_000, studentMonths: 12, rates: rates2027 }).studentCredit).toBe(4_020)
    expect(calculateOsvcIncomeTax({ profit: 400_000, studentMonths: 6, rates: rates2027 }).studentCredit).toBe(2_010)
  })

  it('gives školkovné up to the minimum wage per child (§ 35bd odst. 1)', () => {
    const result = calculateOsvcIncomeTax({ profit: 600_000, childPlacementFees: [30_000, 10_000], rates: rates2027 })
    expect(result.childPlacementCredit).toBe(34_900)
    // 90 000 − 30 840 − 34 900
    expect(result.taxAfterCredits).toBe(24_260)
  })

  it('gives the sales registration credit: 5 000 Kč, less when 15 % of the base minus the payer credit is lower (§ 35be)', () => {
    const creditFor = (profit: number) =>
      calculateOsvcIncomeTax({ profit, isFirstYearWithRegisteredSales: true, rates: rates2027 }).salesRegistrationCredit
    expect(creditFor(400_000)).toBe(5_000)
    expect(creditFor(230_000)).toBe(3_660)
    expect(creditFor(200_000)).toBe(0)
  })

  it('gives none of these before 2027, when the rates do not define them', () => {
    const result = calculateOsvcIncomeTax({
      profit: 600_000,
      studentMonths: 12,
      childPlacementFees: [30_000],
      isFirstYearWithRegisteredSales: true,
      rates: rates2025,
    })
    expect([result.studentCredit, result.childPlacementCredit, result.salesRegistrationCredit]).toEqual([0, 0, 0])
  })
})
