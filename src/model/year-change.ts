import type { TaxYearData } from '../data/tax-years'
import { computeResults } from './compute'
import type { Inputs } from './inputs'

/**
 * Net monthly income of the previous year for the same inputs, and how much the current year differs (PRD "Tax years").
 *
 * @param {object} params
 * @param {Inputs} params.inputs the current year's inputs, applied to both years
 * @param {TaxYearData} params.data the current year
 * @param {TaxYearData} [params.previousData] the year before; without it there is nothing to compare
 * @returns {{ previousNetMonthly: number, difference: number } | null} difference = current − previous, in Kč a month
 */
export const yearOnYearChangeFor = ({
  inputs,
  data,
  previousData,
}: {
  inputs: Inputs
  data: TaxYearData
  previousData?: TaxYearData
}) => {
  if (previousData === undefined) return null
  const currentNetMonthly = computeResults({ inputs, data }).plan.netMonthly
  const previousNetMonthly = computeResults({ inputs, data: previousData }).plan.netMonthly
  return { previousNetMonthly, difference: currentNetMonthly - previousNetMonthly }
}
