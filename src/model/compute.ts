import {
  calculateOsvcIncomeTax,
  calculateOsvcPlan,
  calculateOsvcSicknessInsurance,
  findGrossWageForNetWage,
  pausalniDanBandFor,
  type ExpenseRate,
} from '../calc'
import { buildYearRates, unverifiedValuesFor, type TaxYearData } from '../data/tax-years'
import { costsPerYearFor } from './costs'
import { type Inputs, workingDaysFor } from './inputs'

/** The income-tax options the plan takes: credits and deductions from the inputs (the plan adds the profit and the rate). */
export type IncomeTaxOptions = Omit<Parameters<typeof calculateOsvcIncomeTax>[0], 'profit' | 'rates'>

/** Invoiced amount above which the model is out of scope: the 3rd paušální band, higher tax and VAT (PRD "Behaviour"). */
export const INVOICED_SCOPE_LIMIT = 1_500_000

/** The warnings the screens show. None of them blocks input. */
export type WarningCode = 'aboveScope' | 'grossBelowMinimumWage' | 'pausalniDanAboveBand' | 'childBonusNotEligible'

/** § 15 odst. 1: the deductible value of one unpaid blood donation, in Kč. */
export const BLOOD_DONATION_VALUE = 3_000
/** § 15 odst. 1: the deductible value of one organ or stem-cell donation, in Kč. */
export const ORGAN_DONATION_VALUE = 20_000

/**
 * The credits and deductions of the inputs, in the form the income-tax calculator takes them. Donations include the
 * blood and organ donations, each valued by § 15 odst. 1 (zákon 586/1992 Sb.).
 *
 * @param {object} params
 * @param {Inputs} params.inputs
 * @returns {IncomeTaxOptions}
 */
export const incomeTaxOptionsFor = ({ inputs }: { inputs: Inputs }): IncomeTaxOptions => ({
  childrenDetail: inputs.children.map((child) => ({ months: child.months, hasZtpP: child.hasZtpP })),
  childPlacementFees: inputs.children.map((child) => child.preschoolFees),
  spouseCaringForChild: inputs.credits.spouse,
  spouseHasZtpP: inputs.credits.spouseHasZtpP,
  disabilityDegree1or2: inputs.credits.disability === 'degree1or2',
  disabilityDegree3: inputs.credits.disability === 'degree3',
  ztpHolder: inputs.credits.ztpHolder,
  studentMonths: inputs.credits.studentMonths,
  isFirstYearWithRegisteredSales: inputs.credits.isFirstYearWithRegisteredSales,
  donations:
    inputs.deductions.donations +
    BLOOD_DONATION_VALUE * inputs.deductions.bloodDonations +
    ORGAN_DONATION_VALUE * inputs.deductions.organDonations,
  mortgageInterest: inputs.deductions.mortgageInterest,
  mortgageInterestPre2021: inputs.deductions.mortgageInterestPre2021,
  mortgageInterestMonths: inputs.deductions.mortgageMonths,
  retirementProducts: inputs.deductions.retirementProducts,
})

/**
 * The shares of the income that count as 80 % and as 60 % or 80 % expenses, for the band limits of § 2a odst. 5.
 * The user has one expense rate, so the whole income is in its group.
 *
 * @param {object} params
 * @param {ExpenseRate} params.expenseRate
 * @returns {{ shareAt80Percent: number, shareAt60Or80Percent: number }}
 */
const expenseRateSharesFor = ({ expenseRate }: { expenseRate: ExpenseRate }) => ({
  shareAt80Percent: expenseRate === 0.8 ? 1 : 0,
  shareAt60Or80Percent: expenseRate === 0.6 || expenseRate === 0.8 ? 1 : 0,
})

/**
 * Sickness insurance of the OSVČ, if the user chose it (§ 5b zákona 589/1992 Sb.): the premium, else nothing.
 *
 * @param {object} params
 * @param {Inputs} params.inputs
 * @param {ReturnType<typeof buildYearRates>} params.rates
 */
const sicknessInsuranceFor = ({ inputs, rates }: { inputs: Inputs; rates: ReturnType<typeof buildYearRates> }) => {
  if (!inputs.sicknessInsurance.enabled) {
    return { enabled: false, monthlyAssessmentBase: 0, monthlyPremium: 0, yearlyPremium: 0 }
  }
  const premium = calculateOsvcSicknessInsurance({
    monthlyAssessmentBase: inputs.sicknessInsurance.monthlyAssessmentBase ?? undefined,
    rates: rates.sicknessInsurance,
  })
  return { enabled: true, ...premium }
}

/**
 * Computes everything the screens show for one tax year: from the inputs and the year's data to the plan, the
 * paušální daň comparison, the gross salary equivalent and the warnings. It is the single entry point of the model.
 *
 * Legal references: the plan and its tax in zákon 586/1992 Sb. (§ 7, § 15, § 16, § 35ba–35c), the insurance in
 * zákon 589/1992 Sb. and 592/1992 Sb., the paušální daň in § 2a–2b and § 38lk, the sickness insurance in § 5b.
 *
 * @param {object} params
 * @param {Inputs} params.inputs what the user entered
 * @param {TaxYearData} params.data the year's official or custom data
 */
export const computeResults = ({ inputs, data }: { inputs: Inputs; data: TaxYearData }) => {
  const rates = buildYearRates({ data, isNewOsvc: inputs.isNewOsvc })
  const workingDays = workingDaysFor({ inputs, data })
  const costsPerYear = costsPerYearFor({ costs: inputs.costs })
  const sicknessInsurance = sicknessInsuranceFor({ inputs, rates })
  const incomeTaxOptions = incomeTaxOptionsFor({ inputs })

  const planBase = {
    workingDays,
    vacationDays: inputs.vacationDays,
    hoursPerDay: inputs.hoursPerDay,
    nonBillableHoursPerYear: inputs.nonBillableHoursPerYear,
    hourlyRate: inputs.hourlyRate,
    expenseRate: inputs.expenseRate,
    costsPerYear,
    reserveMonths: inputs.reserveMonths,
    invoiceAmount: inputs.invoiceAmount,
    sicknessInsurancePerYear: sicknessInsurance.yearlyPremium,
    incomeTaxOptions,
    rates: rates.plan,
  }

  // the regular regime, without overrides: it gives the invoiced amount for the paušální daň band
  const regularPlan = calculateOsvcPlan(planBase)
  const { invoiced } = regularPlan
  const { shareAt80Percent, shareAt60Or80Percent } = expenseRateSharesFor({ expenseRate: inputs.expenseRate })
  const pausalniDanBand = pausalniDanBandFor({ income: invoiced, shareAt80Percent, shareAt60Or80Percent })
  const band = pausalniDanBand.band
  // above band 2 the amount is the band 3 one: the app does not offer it, and isAvailable is false
  const bandIndex = band === 1 ? 0 : band === 2 ? 1 : 2
  const isSurchargeApplied = band === 1 && inputs.withSalesRegistrationSurcharge
  const monthlyAmount =
    data.pausalniDanMonthly[bandIndex] + (isSurchargeApplied ? (data.salesRegistrationSurcharge ?? 0) : 0)
  const pausalniDan = {
    band,
    limit: pausalniDanBand.limit,
    monthlyAmount,
    yearlyAmount: monthlyAmount * 12,
    isAvailable: band === 1 || band === 2,
  }
  const pausalniDanMonthly = inputs.usesPausalniDan ? monthlyAmount : undefined

  const calculatedPlan = inputs.usesPausalniDan ? calculateOsvcPlan({ ...planBase, pausalniDanMonthly }) : regularPlan
  const plan = calculateOsvcPlan({
    ...planBase,
    pausalniDanMonthly,
    taxDeductibleCostsOverride: inputs.overrides.taxDeductibleCosts ?? undefined,
    totalLeviesOverride: inputs.overrides.totalLevies ?? undefined,
  })

  // § 2a–2b: the paušální daň against the regular levies; sickness insurance is the same on both sides, so it is left out
  const yearlyRegular = regularPlan.healthInsurance + regularPlan.socialInsurance + regularPlan.incomeTax
  const pausalniDanHint = {
    isAvailable: pausalniDan.isAvailable,
    band,
    yearlyPausalniDan: pausalniDan.yearlyAmount,
    yearlyRegular,
    yearlySaving: yearlyRegular - pausalniDan.yearlyAmount,
  }

  // the employee comparison: the same personal credits as the OSVČ side (§ 35ba, § 35c)
  const grossEquivalent = findGrossWageForNetWage({
    targetNetWage: plan.netMonthly,
    rates: rates.employee,
    // a child the OSVČ claims for no months is not claimed for the employee either
    childrenDetail: inputs.children.filter((child) => child.months > 0).map((child) => ({ hasZtpP: child.hasZtpP })),
    isStudent: inputs.credits.studentMonths > 0,
    ztpHolder: inputs.credits.ztpHolder,
    disabilityDegree1or2: inputs.credits.disability === 'degree1or2',
    disabilityDegree3: inputs.credits.disability === 'degree3',
  })

  const warnings: WarningCode[] = [
    ...(plan.invoiced > INVOICED_SCOPE_LIMIT ? (['aboveScope'] as const) : []),
    ...(grossEquivalent.grossWage < data.minimumWage ? (['grossBelowMinimumWage'] as const) : []),
    ...(inputs.usesPausalniDan && !pausalniDan.isAvailable ? (['pausalniDanAboveBand'] as const) : []),
    ...(!inputs.usesPausalniDan &&
    !plan.incomeTaxDetail.isChildBonusEligible &&
    plan.incomeTaxDetail.unpaidChildCredit > 0
      ? (['childBonusNotEligible'] as const)
      : []),
  ]

  const shareOfInvoiced = (amount: number) => (plan.invoiced === 0 ? 0 : amount / plan.invoiced)

  return {
    year: data.year,
    workingDays,
    costsPerYear,
    rates,
    sicknessInsurance,
    incomeTaxOptions,
    pausalniDan,
    plan,
    calculatedPlan,
    pausalniDanHint,
    grossEquivalent,
    warnings,
    percentages: {
      levies: shareOfInvoiced(plan.totalLevies),
      costs: shareOfInvoiced(costsPerYear),
      reserve: shareOfInvoiced(plan.reservePerYear),
      holiday: shareOfInvoiced(plan.holidayPerYear),
    },
    unverifiedValues: unverifiedValuesFor({ data }),
  }
}

/** Everything `computeResults` returns. */
export type Results = ReturnType<typeof computeResults>
