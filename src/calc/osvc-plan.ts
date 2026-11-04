import { calculateOsvcIncomeTax, type OsvcIncomeTaxRates } from './osvc-income-tax'
import { calculateOsvcHealthInsurance, calculateOsvcSocialInsurance } from './osvc-insurance'
import { calculateFlatRateExpenses, type ExpenseRate } from './osvc-regimes'
import { roundHalfAwayFromZero } from './rounding'

export type OsvcPlanRates = {
  incomeTax: OsvcIncomeTaxRates
  healthInsurance: { minimumAssessmentBase: number }
  socialInsurance: { profitShare: number; minimumAssessmentBase: number; maximumAssessmentBase: number }
}

type IncomeTaxOptions = Omit<Parameters<typeof calculateOsvcIncomeTax>[0], 'profit' | 'rates'>

const shareOfInvoice = ({ invoiceAmount, part, invoiced }: { invoiceAmount: number; part: number; invoiced: number }) =>
  invoiced === 0 ? 0 : roundHalfAwayFromZero((invoiceAmount * part) / invoiced, -2)

/**
 * The OSVČ yearly plan from the PRD: from working time and hourly rate to net income, the money to set aside,
 * and how to split one invoice. Rounding follows the source spreadsheet (Sheets ROUND).
 *
 * @param {object} params
 * @param {number} params.workingDays working days in the year
 * @param {number} params.vacationDays
 * @param {number} params.hoursPerDay hours worked per day, including non-billable work
 * @param {number} params.nonBillableHoursPerYear
 * @param {number} params.hourlyRate
 * @param {ExpenseRate} params.expenseRate flat-rate expense rate (výdajový paušál)
 * @param {number} params.costsPerYear real business costs, paid from the money after tax
 * @param {number} params.reserveMonths months of reserve to build each year
 * @param {number} [params.invoiceAmount=0] invoice to split
 * @param {number} [params.sicknessInsurancePerYear=0] voluntary sickness insurance
 * @param {number} [params.pausalniDanMonthly] when set, the paušální daň replaces ZP, SP and income tax
 * @param {number} [params.taxDeductibleCostsOverride]
 * @param {number} [params.totalLeviesOverride]
 * @param {IncomeTaxOptions} [params.incomeTaxOptions] credits and deductions passed to the income tax
 * @param {OsvcPlanRates} params.rates
 */
export const calculateOsvcPlan = ({
  workingDays,
  vacationDays,
  hoursPerDay,
  nonBillableHoursPerYear,
  hourlyRate,
  expenseRate,
  costsPerYear,
  reserveMonths,
  invoiceAmount = 0,
  sicknessInsurancePerYear = 0,
  pausalniDanMonthly,
  taxDeductibleCostsOverride,
  totalLeviesOverride,
  incomeTaxOptions = {},
  rates,
}: {
  workingDays: number
  vacationDays: number
  hoursPerDay: number
  nonBillableHoursPerYear: number
  hourlyRate: number
  expenseRate: ExpenseRate
  costsPerYear: number
  reserveMonths: number
  invoiceAmount?: number
  sicknessInsurancePerYear?: number
  pausalniDanMonthly?: number
  taxDeductibleCostsOverride?: number
  totalLeviesOverride?: number
  incomeTaxOptions?: IncomeTaxOptions
  rates: OsvcPlanRates
}) => {
  const billableHours = (workingDays - vacationDays) * hoursPerDay - nonBillableHoursPerYear
  const invoiced = billableHours * hourlyRate
  const taxDeductibleCosts = taxDeductibleCostsOverride ?? calculateFlatRateExpenses({ income: invoiced, expenseRate }).expenses

  const incomeTaxResult = calculateOsvcIncomeTax({
    qualifyingIncome: invoiced,
    ...incomeTaxOptions,
    profit: invoiced - taxDeductibleCosts,
    rates: rates.incomeTax,
  })
  const health = calculateOsvcHealthInsurance({ income: invoiced, expenses: taxDeductibleCosts, rates: rates.healthInsurance })
  const social = calculateOsvcSocialInsurance({ income: invoiced, expenses: taxDeductibleCosts, rates: rates.socialInsurance })

  const calculatedLevies =
    pausalniDanMonthly === undefined
      ? health.premium + social.premium + incomeTaxResult.taxTotal + sicknessInsurancePerYear
      : pausalniDanMonthly * 12 + sicknessInsurancePerYear
  const totalLevies = totalLeviesOverride ?? calculatedLevies

  const afterTax = invoiced - totalLevies
  const afterTaxAndCosts = afterTax - costsPerYear
  const calculationDays = Math.ceil((workingDays / 12) * (12 + reserveMonths))
  const perDay = roundHalfAwayFromZero(afterTaxAndCosts / calculationDays, -1)
  const reservePerYear = (calculationDays - workingDays) * perDay
  // one rounded per-day value for both the yearly holiday and its invoice share (PRD known issue 2)
  const holidayPerYear = vacationDays * perDay
  const netBeforeRounding = afterTaxAndCosts - reservePerYear

  const levies = shareOfInvoice({ invoiceAmount, part: totalLevies, invoiced })
  const costs = shareOfInvoice({ invoiceAmount, part: costsPerYear, invoiced })
  const reserve = shareOfInvoice({ invoiceAmount, part: reservePerYear, invoiced })
  const holiday = shareOfInvoice({ invoiceAmount, part: holidayPerYear, invoiced })

  return {
    billableHours,
    invoiced,
    taxDeductibleCosts,
    taxBase: incomeTaxResult.taxBase,
    incomeTax: incomeTaxResult.taxTotal,
    incomeTaxDetail: incomeTaxResult,
    healthInsurance: health.premium,
    socialInsurance: social.premium,
    totalLevies,
    afterTax,
    afterTaxAndCosts,
    calculationDays,
    perDay,
    reservePerYear,
    holidayPerYear,
    netYearly: roundHalfAwayFromZero(netBeforeRounding, -3),
    // the monthly figure divides the unrounded yearly one, as the sheet does
    netMonthly: roundHalfAwayFromZero(netBeforeRounding / 12, -2),
    invoiceSplit: { levies, costs, reserve, holiday, spend: invoiceAmount - levies - costs - reserve - holiday },
  }
}
