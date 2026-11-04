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
  mortgageInterestCap: number
  retirementProductsCap: number
  unionDuesCap: number
  examFeesCap: number
}

/**
 * Yearly OSVČ personal income tax (daň z příjmů fyzických osob) from 2024,
 * with deductions from the tax base, credits and the child tax credit or bonus.
 *
 * @param {object} params
 * @param {number} params.profit income minus expenses (dílčí základ daně §7)
 * @param {number} [params.firstChildMonths=0] months the credit is claimed for the first child
 * @param {number} [params.secondChildMonths=0]
 * @param {number} [params.thirdChildMonths=0] third and every further child
 * @param {number} [params.donations=0] gifts (dary), taken in full
 * @param {number} [params.mortgageInterest=0] housing loan interest, capped
 * @param {number} [params.retirementProducts=0] deductible retirement products total, capped
 * @param {number} [params.unionDues=0] trade union dues
 * @param {number} [params.examFees=0] further-education exam fees, capped
 * @param {boolean} [params.spouseCaringForChild=false] spouse credit (spouse caring for a child under 3)
 * @param {boolean} [params.disabilityDegree1or2=false]
 * @param {boolean} [params.disabilityDegree3=false]
 * @param {boolean} [params.ztpHolder=false] holder of a ZTP/P card
 * @param {OsvcIncomeTaxRates} params.rates
 */
export const calculateOsvcIncomeTax = ({
  profit,
  firstChildMonths = 0,
  secondChildMonths = 0,
  thirdChildMonths = 0,
  donations = 0,
  mortgageInterest = 0,
  retirementProducts = 0,
  unionDues = 0,
  examFees = 0,
  spouseCaringForChild = false,
  disabilityDegree1or2 = false,
  disabilityDegree3 = false,
  ztpHolder = false,
  rates,
}: {
  profit: number
  firstChildMonths?: number
  secondChildMonths?: number
  thirdChildMonths?: number
  donations?: number
  mortgageInterest?: number
  retirementProducts?: number
  unionDues?: number
  examFees?: number
  spouseCaringForChild?: boolean
  disabilityDegree1or2?: boolean
  disabilityDegree3?: boolean
  ztpHolder?: boolean
  rates: OsvcIncomeTaxRates
}) => {
  // reference library behaviour: dues count only above the cap, and then only the cap (see known quirks)
  const deductibleUnionDues = unionDues > rates.unionDuesCap ? rates.unionDuesCap : 0
  const deductionsTotal =
    donations +
    Math.min(rates.mortgageInterestCap, mortgageInterest) +
    Math.min(rates.retirementProductsCap, retirementProducts) +
    Math.min(rates.unionDuesCap, deductibleUnionDues) +
    Math.min(rates.examFeesCap, examFees)

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
  const creditsTotal = payerCredit + spouseCredit + disabilityDegree1or2Credit + disabilityDegree3Credit + ztpHolderCredit
  const taxAfterCredits = Math.max(0, taxBeforeCredits - creditsTotal)

  const { first, second, thirdAndMore } = rates.childCreditsMonthly
  const childCredit = firstChildMonths * first + secondChildMonths * second + thirdChildMonths * thirdAndMore
  const childCreditApplied = Math.min(childCredit, taxAfterCredits)
  const taxAfterChildCredit = taxAfterCredits - childCreditApplied
  const childBonus = Math.max(childCredit - childCreditApplied, 0)
  const taxTotal = taxAfterChildCredit - childBonus

  return {
    deductibleUnionDues,
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
    creditsTotal,
    taxAfterCredits,
    childCredit,
    childCreditApplied,
    taxAfterChildCredit,
    childBonus,
    taxTotal,
  }
}

/**
 * Deductible amount for retirement products (penzijní spoření, životní pojištění, DIP…), capped per year.
 * Pension savings count only above the yearly amount that already earns the state contribution.
 *
 * @param {object} params
 * @param {number} [params.pensionSavingsContributions=0] own yearly contributions to pension savings
 * @param {number} [params.lifeInsurancePremiums=0]
 * @param {number} [params.pensionInsurancePremiums=0]
 * @param {number} [params.longTermInvestmentContributions=0] DIP (dlouhodobý investiční produkt)
 * @param {{ pensionSavingsDeductibleAbove: number, cap: number }} params.rates
 */
export const calculateRetirementProductsDeduction = ({
  pensionSavingsContributions = 0,
  lifeInsurancePremiums = 0,
  pensionInsurancePremiums = 0,
  longTermInvestmentContributions = 0,
  rates,
}: {
  pensionSavingsContributions?: number
  lifeInsurancePremiums?: number
  pensionInsurancePremiums?: number
  longTermInvestmentContributions?: number
  rates: { pensionSavingsDeductibleAbove: number; cap: number }
}) => {
  const pensionSavingsDeductible = Math.max(0, pensionSavingsContributions - rates.pensionSavingsDeductibleAbove)
  const lifeInsuranceDeductible = lifeInsurancePremiums
  const pensionInsuranceDeductible = pensionInsurancePremiums
  const longTermInvestmentDeductible = longTermInvestmentContributions
  const deduction = Math.min(
    rates.cap,
    pensionSavingsDeductible + lifeInsuranceDeductible + pensionInsuranceDeductible + longTermInvestmentDeductible,
  )
  return {
    pensionSavingsDeductible,
    lifeInsuranceDeductible,
    pensionInsuranceDeductible,
    longTermInvestmentDeductible,
    deduction,
  }
}
