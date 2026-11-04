import { calculateEmployeeNetWage, type EmployeeNetWageRates } from './employee-net-wage'

type NetWageOptions = Omit<Parameters<typeof calculateEmployeeNetWage>[0], 'grossWage' | 'rates'>

/**
 * Net wage rounds in steps (the advance base rounds up to hundreds), so it is not strictly increasing.
 * Below the bisection result, a lower gross can only reach the target within a few hundred crowns.
 */
const BACKWARD_SCAN_WINDOW = 400

/**
 * Smallest whole-crown monthly gross wage whose employee net wage reaches the target.
 * Used to express OSVČ net income as an equivalent employee salary.
 *
 * @param {object} params
 * @param {number} params.targetNetWage monthly net wage to reach
 * @param {EmployeeNetWageRates} params.rates payroll rates of the year
 * @param {number} [params.children] and the other calculateEmployeeNetWage options, applied to every candidate
 * @returns the payroll breakdown of the gross found, plus `isExact` when net equals the target
 */
export const findGrossWageForNetWage = ({
  targetNetWage,
  rates,
  ...options
}: { targetNetWage: number; rates: EmployeeNetWageRates } & NetWageOptions) => {
  const payrollFor = (grossWage: number) => calculateEmployeeNetWage({ ...options, grossWage, rates })
  const reachesTarget = (grossWage: number) => payrollFor(grossWage).netWage >= targetNetWage

  const findUpperBound = (grossWage: number): number =>
    reachesTarget(grossWage) ? grossWage : findUpperBound(grossWage * 2)
  const bisect = (low: number, high: number): number => {
    if (high - low <= 1) return high
    const middle = Math.floor((low + high) / 2)
    return reachesTarget(middle) ? bisect(low, middle) : bisect(middle, high)
  }

  const upperBound = findUpperBound(Math.max(1, Math.ceil(targetNetWage)))
  const candidate = reachesTarget(0) ? 0 : bisect(0, upperBound)
  const scanStart = Math.max(0, candidate - BACKWARD_SCAN_WINDOW)
  const grossWage =
    Array.from({ length: candidate - scanStart }, (_, offset) => scanStart + offset).find(reachesTarget) ?? candidate

  const payroll = payrollFor(grossWage)
  return { ...payroll, grossWage, isExact: payroll.netWage === targetNetWage }
}
