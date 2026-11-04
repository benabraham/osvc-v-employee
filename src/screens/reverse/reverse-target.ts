/**
 * The numbers of the reverse screen: the starting target and the search for the hourly rate that reaches a net
 * monthly income. Pure, so the screen only renders what these return. The search itself is the reverse of the
 * PRD plan (see `src/model/reverse.ts`).
 */
import type { TaxYearData } from '../../data/tax-years'
import { findHourlyRateForNetMonthly, type Inputs } from '../../model'

const THOUSAND = 1_000

/**
 * The starting target of the reverse screen: the current net monthly income, rounded up to the next thousand.
 *
 * @param {object} params
 * @param {number} params.netMonthly the current net monthly income, Kč
 * @returns {number} Kč a month
 */
export const defaultTargetNetMonthlyFor = ({ netMonthly }: { netMonthly: number }): number =>
  Math.ceil(netMonthly / THOUSAND) * THOUSAND

/**
 * The hourly rate that reaches a net monthly income with the other inputs of the year, and what that rate leads to.
 * `isReachable` is false when even the maximum searched rate falls short; the figures then belong to that maximum.
 *
 * @param {object} params
 * @param {number} params.targetNetMonthly net income the user wants, Kč a month
 * @param {Inputs} params.inputs the active inputs; their hourly rate is only compared against
 * @param {TaxYearData} params.data the active year's data
 */
export const reverseSearchFor = ({
  targetNetMonthly,
  inputs,
  data,
}: {
  targetNetMonthly: number
  inputs: Inputs
  data: TaxYearData
}) => {
  const { hourlyRate, results, isReachable } = findHourlyRateForNetMonthly({ targetNetMonthly, inputs, data })
  return {
    hourlyRate,
    isReachable,
    invoiced: results.plan.invoiced,
    netMonthly: results.plan.netMonthly,
    grossEquivalent: results.grossEquivalent.grossWage,
    currentHourlyRate: inputs.hourlyRate,
    difference: hourlyRate - inputs.hourlyRate,
  }
}
