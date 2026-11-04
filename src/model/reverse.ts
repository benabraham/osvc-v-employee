import type { TaxYearData } from '../data/tax-years'
import { computeResults, type Results } from './compute'
import type { Inputs } from './inputs'

/** The largest hourly rate the search tries, in Kč: above it the model is out of scope anyway. */
export const MAXIMUM_SEARCHED_HOURLY_RATE = 20_000

/**
 * Smallest whole-crown hourly rate whose net monthly income reaches the target (the reverse of the PRD plan).
 * Net income rises with the rate, so the search doubles the rate until it reaches the target, then bisects.
 * Overrides are cleared for the search: the rate must come from the calculated values.
 *
 * @param {object} params
 * @param {number} params.targetNetMonthly net income to reach, Kč a month
 * @param {Inputs} params.inputs the other inputs
 * @param {TaxYearData} params.data the year's data
 * @returns {{ hourlyRate: number, results: Results, isReachable: boolean }} isReachable is false when even the
 *   maximum rate falls short; the rate is then the maximum
 */
export const findHourlyRateForNetMonthly = ({
  targetNetMonthly,
  inputs,
  data,
}: {
  targetNetMonthly: number
  inputs: Inputs
  data: TaxYearData
}) => {
  const resultsAt = (hourlyRate: number): Results =>
    computeResults({ inputs: { ...inputs, hourlyRate, overrides: { taxDeductibleCosts: null, totalLevies: null } }, data })
  const reachesTarget = (hourlyRate: number) => resultsAt(hourlyRate).plan.netMonthly >= targetNetMonthly

  if (reachesTarget(0)) return { hourlyRate: 0, results: resultsAt(0), isReachable: true }

  if (!reachesTarget(MAXIMUM_SEARCHED_HOURLY_RATE)) {
    return { hourlyRate: MAXIMUM_SEARCHED_HOURLY_RATE, results: resultsAt(MAXIMUM_SEARCHED_HOURLY_RATE), isReachable: false }
  }

  // the bracket [low, high]: low does not reach the target, high does
  const bracket = (low: number, high: number): [number, number] =>
    reachesTarget(high) ? [low, high] : bracket(high, Math.min(high * 2, MAXIMUM_SEARCHED_HOURLY_RATE))
  // invariant: low does not reach the target, high does
  const bisect = (low: number, high: number): number => {
    if (high - low <= 1) return high
    const middle = Math.floor((low + high) / 2)
    return reachesTarget(middle) ? bisect(low, middle) : bisect(middle, high)
  }

  const [low, high] = bracket(0, 1)
  const hourlyRate = bisect(low, high)
  return { hourlyRate, results: resultsAt(hourlyRate), isReachable: true }
}
