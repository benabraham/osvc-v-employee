/**
 * The comparison of the scenarios and the current calculation: a table from the desktop breakpoint, and swipeable
 * cards below it. Both show the same rows (`comparisonMetrics`); CSS decides which one is visible.
 */
import { useT } from '../../app/context'
import { formatNumber, formatPercent } from '../../i18n'
import { Money, ResultRow, currentLocale } from '../../ui'
import { comparisonMetrics, metricValueFor, type ComparisonColumn, type ComparisonMetric, type MetricValue } from './scenario-results'

/**
 * What one metric shows in one column, with the "best" badge on the net monthly income when the column is the best.
 *
 * @param {object} props
 * @param {MetricValue} props.value
 * @param {boolean} props.isBest
 */
const MetricText = ({ value, isBest }: { value: MetricValue; isBest: boolean }) => {
  const t = useT()
  const locale = currentLocale.value
  const bestBadge = isBest ? (
    <>
      {' '}
      <span class="badge accent">{t('scenarios.compare.best')}</span>
    </>
  ) : null

  switch (value.kind) {
    case 'year':
      return <>{String(value.year)}</>
    case 'hourlyRate':
      return <>{`${formatNumber(value.amount, { locale })} ${t('unit.czkPerHour')}`}</>
    case 'percent':
      return <>{formatPercent(value.share, locale)}</>
    case 'yesNo':
      return <>{value.value ? t('scenarios.value.yes') : t('scenarios.value.no')}</>
    case 'money':
      return (
        <>
          {isBest ? (
            <span class="scenario-best">
              <Money value={value.amount} isApproximate={value.isApproximate} />
            </span>
          ) : (
            <Money value={value.amount} isApproximate={value.isApproximate} />
          )}
          {bestBadge}
        </>
      )
    case 'missing':
      return <>{t('scenarios.value.none')}</>
  }
}

/**
 * The comparison table: a row per metric, a column per calculation, the current one first.
 *
 * @param {object} props
 * @param {ComparisonColumn[]} props.columns
 * @param {string[]} props.bestIds ids of the columns with the highest net monthly income
 */
const ComparisonTable = ({ columns, bestIds }: { columns: ComparisonColumn[]; bestIds: string[] }) => {
  const t = useT()
  return (
    <div class="table-scroll scenario-table">
      <table class="data-table" aria-label={t('scenarios.compare.table')}>
        <thead>
          <tr>
            <th scope="col">{t('scenarios.compare.metric')}</th>
            {columns.map((column) => (
              <th scope="col" key={column.id}>
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonMetrics.map((metric) => (
            <tr key={metric}>
              <th scope="row">{t(`scenarios.metric.${metric}`)}</th>
              {columns.map((column) => {
                const isBest = metric === 'netMonthly' && bestIds.includes(column.id)
                return (
                  <td key={column.id} class={isBest ? 'is-best' : undefined}>
                    <MetricText value={metricValueFor({ metric, column })} isBest={isBest} />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * The same comparison for small screens: one card per calculation, swiped sideways with scroll snapping. The
 * region takes keyboard focus, so the arrow keys scroll it too.
 *
 * @param {object} props
 * @param {ComparisonColumn[]} props.columns
 * @param {string[]} props.bestIds
 */
const ComparisonCards = ({ columns, bestIds }: { columns: ComparisonColumn[]; bestIds: string[] }) => {
  const t = useT()
  return (
    <div class="scenario-swipe" role="region" tabIndex={0} aria-label={t('scenarios.compare.region')}>
      <ul class="scenario-swipe-track">
        {columns.map((column) => {
          const isBest = bestIds.includes(column.id)
          return (
            <li key={column.id} class="scenario-card">
              <h3>{column.name}</h3>
              <dl class="result-list">
                {comparisonMetrics.map((metric: ComparisonMetric) => (
                  <ResultRow key={metric} label={t(`scenarios.metric.${metric}`)}>
                    <MetricText value={metricValueFor({ metric, column })} isBest={isBest && metric === 'netMonthly'} />
                  </ResultRow>
                ))}
              </dl>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * The comparison section: table on desktop, swipeable cards on mobile.
 *
 * @param {object} props
 * @param {ComparisonColumn[]} props.columns the current calculation first, then the scenarios
 * @param {string[]} props.bestIds ids of the best columns (see `bestColumnIdsFor`)
 */
export const ScenarioComparison = ({ columns, bestIds }: { columns: ComparisonColumn[]; bestIds: string[] }) => {
  const t = useT()
  return (
    <section class="card" aria-labelledby="scenario-compare-title">
      <h2 id="scenario-compare-title">{t('scenarios.compare.heading')}</h2>
      <ComparisonTable columns={columns} bestIds={bestIds} />
      <ComparisonCards columns={columns} bestIds={bestIds} />
    </section>
  )
}
