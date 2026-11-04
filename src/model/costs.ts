import { roundHalfAwayFromZero } from '../calc/rounding'
import type { CostItem } from './inputs'

/**
 * Yearly cost of one row of the costs list: the price spread over its months of amortisation (sheet "náklady").
 * A purchase that is used over 36 months costs a third of its price a year; a yearly cost stays its price.
 *
 * @param {object} params
 * @param {CostItem} params.cost
 * @returns {number} Kč a year; 0 when the months are not positive
 */
export const yearlyCostFor = ({ cost }: { cost: CostItem }) => {
  if (cost.months <= 0) return 0
  return (cost.price * 12) / cost.months
}

/**
 * Real business costs of the year: the costs list summed and rounded to whole crowns (PRD "Inputs").
 *
 * @param {object} params
 * @param {CostItem[]} params.costs
 * @returns {number} Kč a year
 */
export const costsPerYearFor = ({ costs }: { costs: CostItem[] }) =>
  roundHalfAwayFromZero(costs.reduce((total, cost) => total + yearlyCostFor({ cost }), 0))
