import { modulo } from './rounding'

/** Monthly child tax credit (daňové zvýhodnění) per child by order. */
export type ChildCreditsMonthly = { first: number; second: number; thirdAndMore: number }

export type OsvcIncomeTaxRates = {
  baseTaxRate: number
  solidarityTaxRate: number
  /** yearly tax base above which the solidarity rate applies (36 × average wage from 2024) */
  solidarityThreshold: number
  payerCredit: number
  spouseCredit: number
  disabilityDegree1or2Credit: number
  disabilityDegree3Credit: number
  ztpHolderCredit: number
  childCreditsMonthly: ChildCreditsMonthly
  /** § 15 odst. 4: 150 000 Kč per household for housing acquired from 2021 */
  mortgageInterestCap: number
  /** zákon 386/2020 Sb. čl. IV: 300 000 Kč for housing acquired before 2021, also the combined cap */
  mortgageInterestPre2021Cap: number
  /** § 15 odst. 6: 48 000 Kč for retirement products and long-term care insurance together */
  retirementProductsCap: number
  /** § 15 odst. 1: donations count when above 2 % of the tax base… */
  donationsMinimumShare: number
  /** …or at least 1 000 Kč… */
  donationsMinimumAmount: number
  /** …up to 15 % of the tax base */
  donationsMaximumShare: number
  /** for the child bonus test: § 6 and § 7 income of at least 6 × the minimum wage (monthly) */
  minimumWage: number
  /** § 35c odst. 3: a bonus under 100 Kč is not paid */
  minimumChildBonus: number
  /** from 2027, § 35bc: student credit per year (4 020 Kč); absent before 2027 */
  studentCredit?: number
  /** from 2027, § 35bd: školkovné up to the minimum wage per child; absent before 2027 */
  childPlacementCreditCapIsMinimumWage?: boolean
  /** from 2027, § 35be: sales registration credit (5 000 Kč) in the first period with registered sales */
  salesRegistrationCredit?: number
}

/** § 35be odst. 1: the sales registration credit is capped at 15 % of the § 7 base minus the payer credit. */
export const SALES_REGISTRATION_CREDIT_BASE_SHARE = 0.15

/** § 35c odst. 4: the bonus needs § 6 or § 7 income of at least this many monthly minimum wages. */
export const CHILD_BONUS_MINIMUM_WAGES = 6

/**
 * Deductible donations (bezúplatná plnění, § 15 odst. 1): nothing below the floor, capped at a share of the base.
 *
 * @param {object} params
 * @param {number} params.donations total donated in the year
 * @param {number} params.taxBase tax base before deductions
 * @param {Pick<OsvcIncomeTaxRates, 'donationsMinimumShare' | 'donationsMinimumAmount' | 'donationsMaximumShare'>} params.rates
 * @returns {number}
 */
export const deductibleDonationsFor = ({
  donations,
  taxBase,
  rates,
}: {
  donations: number
  taxBase: number
  rates: Pick<OsvcIncomeTaxRates, 'donationsMinimumShare' | 'donationsMinimumAmount' | 'donationsMaximumShare'>
}) => {
  const isAboveFloor = donations > rates.donationsMinimumShare * taxBase || donations >= rates.donationsMinimumAmount
  if (!isAboveFloor) return 0
  return Math.min(donations, Math.max(0, rates.donationsMaximumShare * taxBase))
}

/**
 * Deductible housing loan interest: newer loans first up to their cap, then older loans up to the combined cap.
 *
 * @param {object} params
 * @param {number} params.mortgageInterest interest on loans for housing acquired from 2021
 * @param {number} params.mortgageInterestPre2021 interest on loans for housing acquired before 2021
 * @param {Pick<OsvcIncomeTaxRates, 'mortgageInterestCap' | 'mortgageInterestPre2021Cap'>} params.rates
 * @returns {number}
 */
export const deductibleMortgageInterestFor = ({
  mortgageInterest,
  mortgageInterestPre2021,
  rates,
}: {
  mortgageInterest: number
  mortgageInterestPre2021: number
  rates: Pick<OsvcIncomeTaxRates, 'mortgageInterestCap' | 'mortgageInterestPre2021Cap'>
}) => {
  const fromNewLoans = Math.min(mortgageInterest, rates.mortgageInterestCap)
  const fromOldLoans = Math.min(mortgageInterestPre2021, rates.mortgageInterestPre2021Cap - fromNewLoans)
  return fromNewLoans + Math.max(0, fromOldLoans)
}

/**
 * Yearly OSVČ personal income tax (daň z příjmů fyzických osob) from 2024,
 * with deductions from the tax base, credits and the child tax credit or bonus.
 * Union dues and exam fees are not deductible from 2024 (removed from § 15).
 *
 * @param {object} params
 * @param {number} params.profit income minus expenses (dílčí základ daně § 7)
 * @param {number} [params.qualifyingIncome] § 6 and § 7 income (příjmy, not profit) for the child bonus test;
 *   omit to skip the test
 * @param {number} [params.firstChildMonths=0] months the credit is claimed for the first child
 * @param {number} [params.secondChildMonths=0]
 * @param {number} [params.thirdChildMonths=0] third and every further child
 * @param {number} [params.donations=0] gifts (dary)
 * @param {number} [params.mortgageInterest=0] housing acquired from 2021
 * @param {number} [params.mortgageInterestPre2021=0] housing acquired before 2021
 * @param {number} [params.retirementProducts=0] deductible retirement products total (see calculateRetirementProductsDeduction)
 * @param {boolean} [params.spouseCaringForChild=false] spouse credit (spouse caring for a child under 3)
 * @param {boolean} [params.disabilityDegree1or2=false]
 * @param {boolean} [params.disabilityDegree3=false]
 * @param {boolean} [params.ztpHolder=false] holder of a ZTP/P card
 * @param {number} [params.studentMonths=0] months as a student (from 2027)
 * @param {number[]} [params.childPlacementFees=[]] yearly preschool fees per child (školkovné, from 2027)
 * @param {boolean} [params.isFirstYearWithRegisteredSales=false] sales registration credit (from 2027)
 * @param {OsvcIncomeTaxRates} params.rates
 */
export const calculateOsvcIncomeTax = ({
  profit,
  qualifyingIncome,
  firstChildMonths = 0,
  secondChildMonths = 0,
  thirdChildMonths = 0,
  donations = 0,
  mortgageInterest = 0,
  mortgageInterestPre2021 = 0,
  retirementProducts = 0,
  spouseCaringForChild = false,
  disabilityDegree1or2 = false,
  disabilityDegree3 = false,
  ztpHolder = false,
  studentMonths = 0,
  childPlacementFees = [],
  isFirstYearWithRegisteredSales = false,
  rates,
}: {
  profit: number
  qualifyingIncome?: number
  studentMonths?: number
  childPlacementFees?: number[]
  isFirstYearWithRegisteredSales?: boolean
  firstChildMonths?: number
  secondChildMonths?: number
  thirdChildMonths?: number
  donations?: number
  mortgageInterest?: number
  mortgageInterestPre2021?: number
  retirementProducts?: number
  spouseCaringForChild?: boolean
  disabilityDegree1or2?: boolean
  disabilityDegree3?: boolean
  ztpHolder?: boolean
  rates: OsvcIncomeTaxRates
}) => {
  const deductibleDonations = deductibleDonationsFor({ donations, taxBase: profit, rates })
  const deductibleMortgageInterest = deductibleMortgageInterestFor({ mortgageInterest, mortgageInterestPre2021, rates })
  const deductibleRetirementProducts = Math.min(rates.retirementProductsCap, retirementProducts)
  const deductionsTotal = deductibleDonations + deductibleMortgageInterest + deductibleRetirementProducts

  // § 16: the tax base is rounded down to whole hundreds
  const unroundedTaxBase = profit - deductionsTotal
  const taxBase = unroundedTaxBase - modulo(unroundedTaxBase, 100)

  const taxAtBaseRate = Math.min(rates.solidarityThreshold * rates.baseTaxRate, taxBase * rates.baseTaxRate)
  const taxAtSolidarityRate = Math.max(0, taxBase - rates.solidarityThreshold) * rates.solidarityTaxRate
  const taxBeforeCredits = Math.ceil(taxAtBaseRate + taxAtSolidarityRate)

  const payerCredit = rates.payerCredit
  const spouseCredit = spouseCaringForChild ? rates.spouseCredit : 0
  const disabilityDegree1or2Credit = disabilityDegree1or2 ? rates.disabilityDegree1or2Credit : 0
  const disabilityDegree3Credit = disabilityDegree3 ? rates.disabilityDegree3Credit : 0
  const ztpHolderCredit = ztpHolder ? rates.ztpHolderCredit : 0
  // § 35ba odst. 3: the student credit is one twelfth for each month the condition is met
  const studentCredit = rates.studentCredit === undefined ? 0 : (rates.studentCredit / 12) * studentMonths
  const childPlacementCredit = rates.childPlacementCreditCapIsMinimumWage
    ? childPlacementFees.reduce((total, fees) => total + Math.min(fees, rates.minimumWage), 0)
    : 0
  const salesRegistrationCredit =
    rates.salesRegistrationCredit !== undefined && isFirstYearWithRegisteredSales
      ? Math.min(rates.salesRegistrationCredit, Math.max(0, SALES_REGISTRATION_CREDIT_BASE_SHARE * profit - payerCredit))
      : 0
  const creditsTotal =
    payerCredit +
    spouseCredit +
    disabilityDegree1or2Credit +
    disabilityDegree3Credit +
    ztpHolderCredit +
    studentCredit +
    childPlacementCredit +
    salesRegistrationCredit
  const taxAfterCredits = Math.max(0, taxBeforeCredits - creditsTotal)

  const { first, second, thirdAndMore } = rates.childCreditsMonthly
  const childCredit = firstChildMonths * first + secondChildMonths * second + thirdChildMonths * thirdAndMore
  const childCreditApplied = Math.min(childCredit, taxAfterCredits)
  const taxAfterChildCredit = taxAfterCredits - childCreditApplied

  const isChildBonusEligible =
    qualifyingIncome === undefined || qualifyingIncome >= CHILD_BONUS_MINIMUM_WAGES * rates.minimumWage
  const unpaidCredit = Math.max(childCredit - childCreditApplied, 0)
  const childBonus = isChildBonusEligible && unpaidCredit >= rates.minimumChildBonus ? unpaidCredit : 0
  const taxTotal = taxAfterChildCredit - childBonus

  return {
    deductibleDonations,
    deductibleMortgageInterest,
    deductibleRetirementProducts,
    deductionsTotal,
    taxBase,
    taxAtBaseRate,
    taxAtSolidarityRate,
    taxBeforeCredits,
    payerCredit,
    spouseCredit,
    disabilityDegree1or2Credit,
    disabilityDegree3Credit,
    ztpHolderCredit,
    studentCredit,
    childPlacementCredit,
    salesRegistrationCredit,
    creditsTotal,
    taxAfterCredits,
    childCredit,
    childCreditApplied,
    taxAfterChildCredit,
    isChildBonusEligible,
    childBonus,
    taxTotal,
  }
}

/**
 * Deductible retirement products and long-term care insurance (§ 15 odst. 6 a 7), capped per year.
 * Pension savings count only by the part of each monthly contribution above the level that already earns
 * the maximum state contribution (zákon 427/2011 Sb. § 14); contributions are assumed to be spread evenly.
 *
 * @param {object} params
 * @param {number} [params.pensionSavingsContributions=0] own yearly contributions to pension savings (DPS, PP)
 * @param {number} [params.lifeInsurancePremiums=0] private life insurance
 * @param {number} [params.pensionInsurancePremiums=0] pension insurance with a pension insurance institution
 * @param {number} [params.longTermInvestmentContributions=0] DIP (dlouhodobý investiční produkt)
 * @param {number} [params.longTermCareInsurancePremiums=0] long-term care insurance (from 2024)
 * @param {{ pensionSavingsMonthlyThresholds: number[], cap: number }} params.rates threshold for each month of the year
 */
export const calculateRetirementProductsDeduction = ({
  pensionSavingsContributions = 0,
  lifeInsurancePremiums = 0,
  pensionInsurancePremiums = 0,
  longTermInvestmentContributions = 0,
  longTermCareInsurancePremiums = 0,
  rates,
}: {
  pensionSavingsContributions?: number
  lifeInsurancePremiums?: number
  pensionInsurancePremiums?: number
  longTermInvestmentContributions?: number
  longTermCareInsurancePremiums?: number
  rates: { pensionSavingsMonthlyThresholds: number[]; cap: number }
}) => {
  const monthlyContribution = pensionSavingsContributions / 12
  const pensionSavingsDeductible = rates.pensionSavingsMonthlyThresholds.reduce(
    (total, threshold) => total + Math.max(0, monthlyContribution - threshold),
    0,
  )
  const lifeInsuranceDeductible = lifeInsurancePremiums
  const pensionInsuranceDeductible = pensionInsurancePremiums
  const longTermInvestmentDeductible = longTermInvestmentContributions
  const longTermCareInsuranceDeductible = longTermCareInsurancePremiums
  const deduction = Math.min(
    rates.cap,
    pensionSavingsDeductible +
      lifeInsuranceDeductible +
      pensionInsuranceDeductible +
      longTermInvestmentDeductible +
      longTermCareInsuranceDeductible,
  )
  return {
    pensionSavingsDeductible,
    lifeInsuranceDeductible,
    pensionInsuranceDeductible,
    longTermInvestmentDeductible,
    longTermCareInsuranceDeductible,
    deduction,
  }
}
