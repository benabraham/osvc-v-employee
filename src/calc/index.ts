/**
 * Pure calculators for comparing OSVČ income with an employee salary.
 * Each takes its inputs plus one year's `rates` and returns every intermediate value.
 */
export * from './benefit-eligibility'
export * from './benefits'
export * from './employee-net-wage'
export * from './gross-from-net'
export * from './osvc-income-tax'
export * from './osvc-insurance'
export * from './osvc-plan'
export * from './osvc-regimes'
export { floorDivide, modulo, roundHalfAwayFromZero } from './rounding'

