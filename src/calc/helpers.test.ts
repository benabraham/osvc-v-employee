import { describe, expect, it } from 'vitest'
import { dailyAssessmentBaseFor, osvcMonthlyAssessmentBaseFor } from './benefits'
import { deductibleDonationsFor, deductibleMortgageInterestFor } from './osvc-income-tax'
import { modulo } from './rounding'

describe('dailyAssessmentBaseFor', () => {
  it('spreads 12 months of income over 365 days, rounded to hellers', () => {
    // as in the reference library's 2026 tests
    expect(dailyAssessmentBaseFor({ monthlyAssessmentBase: 52_000 })).toBe(1_709.59)
    expect(dailyAssessmentBaseFor({ monthlyAssessmentBase: 43_850 })).toBe(1_441.64)
  })
})

describe('osvcMonthlyAssessmentBaseFor', () => {
  it('turns the monthly sickness premium into the base at 2.7 %, rounded up', () => {
    const rates = { sicknessInsuranceRatePercent: 2.7 }
    expect(osvcMonthlyAssessmentBaseFor({ monthlySicknessPremium: 1_100, rates })).toBe(40_741)
    expect(osvcMonthlyAssessmentBaseFor({ monthlySicknessPremium: 243, rates })).toBe(9_000)
  })
})

describe('deductibleDonationsFor (zákon 586/1992 Sb. § 15 odst. 1)', () => {
  const rates = { donationsMinimumShare: 0.02, donationsMinimumAmount: 1_000, donationsMaximumShare: 0.15 }

  it.each([
    [900, 500_000, 0],
    [1_000, 500_000, 1_000],
    [15_000, 600_000, 15_000],
    [700, 30_000, 700], // under 1 000 Kč but above 2 % of the base
    [600, 30_000, 0], // exactly 2 % is not above it
    [100_000, 500_000, 75_000],
  ])('%d Kč of donations on a %d Kč base deducts %d Kč', (donations, taxBase, expected) => {
    expect(deductibleDonationsFor({ donations, taxBase, rates })).toBe(expected)
  })
})

describe('deductibleMortgageInterestFor (§ 15 odst. 4; zákon 386/2020 Sb.)', () => {
  const rates = { mortgageInterestCap: 150_000, mortgageInterestPre2021Cap: 300_000 }

  it.each([
    [200_000, 0, 150_000],
    [0, 350_000, 300_000],
    [150_000, 300_000, 300_000],
    [100_000, 100_000, 200_000],
    [120_000, 250_000, 300_000],
  ])('new loans %d and pre-2021 loans %d deduct %d', (mortgageInterest, mortgageInterestPre2021, expected) => {
    expect(deductibleMortgageInterestFor({ mortgageInterest, mortgageInterestPre2021, rates })).toBe(expected)
  })
})

describe('modulo', () => {
  it.each([
    [-150, 100, 50],
    [278_250, 100, 50],
    [39_001, -100, -99],
    [0, 100, 0],
  ])('%d mod %d is %d, with the sign of the divisor like Python', (dividend, divisor, expected) => {
    expect(modulo(dividend, divisor)).toBe(expected)
  })
})
