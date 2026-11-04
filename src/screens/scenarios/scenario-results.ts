/**
 * The comparison of the scenarios and the current calculation: one column each, with the values the table and the
 * swipe cards show. Pure; the screens render what these return.
 */
import { TAX_YEARS } from '../../data/tax-years'
import { computeResults, type Inputs, type Results } from '../../model'
import type { Scenario } from '../../state'

/** One column of the comparison: the current calculation, or a saved scenario. */
export type ComparisonColumn = {
  id: string
  name: string
  year: number
  inputs: Inputs
  /** null when the year has no data (official or custom), so the column shows no calculated values */
  results: Results | null
}

/** The rows of the comparison, in the order they are shown. */
export const comparisonMetrics = [
  'year',
  'hourlyRate',
  'expenseRate',
  'pausalniDan',
  'invoiced',
  'totalLevies',
  'netMonthly',
  'grossEquivalent',
  'perDay',
] as const

export type ComparisonMetric = (typeof comparisonMetrics)[number]

/** What one cell shows: a value of the inputs, a calculated amount, or nothing because the year has no data. */
export type MetricValue =
  | { kind: 'year'; year: number }
  | { kind: 'hourlyRate'; amount: number }
  | { kind: 'percent'; share: number }
  | { kind: 'yesNo'; value: boolean }
  | { kind: 'money'; amount: number; isApproximate: boolean }
  | { kind: 'missing' }

/**
 * Results of a saved scenario, computed with the official data of its year (as the PRD's scenario comparison).
 * Null when the year has no official data: the screen flags the scenario instead of failing.
 *
 * @param {object} params
 * @param {Scenario} params.scenario
 * @returns {Results | null}
 */
export const resultsForScenario = ({ scenario }: { scenario: Scenario }): Results | null => {
  const data = TAX_YEARS[scenario.year]
  if (!data) return null
  return computeResults({ inputs: scenario.inputs, data })
}

/**
 * The columns of the comparison: the current calculation first, then the scenarios in the order they were saved.
 *
 * @param {object} params
 * @param {ComparisonColumn} params.current the current calculation, already computed for the active year
 * @param {Scenario[]} params.scenarios
 * @returns {ComparisonColumn[]}
 */
export const comparisonColumnsFor = ({
  current,
  scenarios,
}: {
  current: ComparisonColumn
  scenarios: Scenario[]
}): ComparisonColumn[] => [
  current,
  ...scenarios.map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    year: scenario.year,
    inputs: scenario.inputs,
    results: resultsForScenario({ scenario }),
  })),
]

/**
 * The columns with the highest net monthly income. Ties give all of them. Nothing is marked when fewer than two
 * columns have results, since there is nothing to compare.
 *
 * @param {object} params
 * @param {ComparisonColumn[]} params.columns
 * @returns {string[]} the ids of the best columns
 */
export const bestColumnIdsFor = ({ columns }: { columns: ComparisonColumn[] }): string[] => {
  const withResults = columns.flatMap((column) =>
    column.results ? [{ id: column.id, netMonthly: column.results.plan.netMonthly }] : [],
  )
  if (withResults.length < 2) return []
  const highest = Math.max(...withResults.map((item) => item.netMonthly))
  return withResults.filter((item) => item.netMonthly === highest).map((item) => item.id)
}

type CalculatedMetric = Exclude<ComparisonMetric, 'year' | 'hourlyRate' | 'expenseRate' | 'pausalniDan'>

const calculatedAmountFor: Record<CalculatedMetric, (results: Results) => number> = {
  invoiced: (results) => results.plan.invoiced,
  totalLevies: (results) => results.plan.totalLevies,
  netMonthly: (results) => results.plan.netMonthly,
  grossEquivalent: (results) => results.grossEquivalent.grossWage,
  perDay: (results) => results.plan.perDay,
}

/**
 * What one metric shows in one column. The year, rate, expense rate and paušální daň come from the inputs and are
 * shown even without data; every calculated amount is missing then.
 *
 * @param {object} params
 * @param {ComparisonMetric} params.metric
 * @param {ComparisonColumn} params.column
 * @returns {MetricValue}
 */
export const metricValueFor = ({ metric, column }: { metric: ComparisonMetric; column: ComparisonColumn }): MetricValue => {
  if (metric === 'year') return { kind: 'year', year: column.year }
  if (metric === 'hourlyRate') return { kind: 'hourlyRate', amount: column.inputs.hourlyRate }
  if (metric === 'expenseRate') return { kind: 'percent', share: column.inputs.expenseRate }
  if (metric === 'pausalniDan') return { kind: 'yesNo', value: column.inputs.usesPausalniDan }
  if (column.results === null) return { kind: 'missing' }
  return {
    kind: 'money',
    amount: calculatedAmountFor[metric](column.results),
    isApproximate: metric === 'grossEquivalent',
  }
}
