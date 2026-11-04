import { useT } from '../../app/context'
import type { Results } from '../../model'
import { Money } from '../../ui'
import { moneyText } from './calc-format'

/**
 * The live headline: net income per month with its change against the previous year, and the gross salary
 * it equals. It is the one aria-live region of the screen, so a screen reader hears each change.
 *
 * @param {object} props
 * @param {Results} props.results
 * @param {{ difference: number, previousYear: number } | null} props.yearChange net monthly change against the previous year
 * @param {boolean} props.isUsingCustomData the year is calculated with the user's own numbers
 */
export const CalcHeadline = ({
  results,
  yearChange,
  isUsingCustomData,
}: {
  results: Results
  yearChange: { difference: number; previousYear: number } | null
  isUsingCustomData: boolean
}) => {
  const t = useT()
  const { grossEquivalent, plan, unverifiedValues } = results
  const hasUnverifiedValues = unverifiedValues.length > 0
  const signedChange = yearChange === null ? '' : `${yearChange.difference > 0 ? '+' : ''}${moneyText(yearChange.difference)}`

  return (
    <div class="card calc-headline" aria-live="polite">
      <div class="row">
        <span class="headline-label">{t('calc.headline.label')}</span>
        {isUsingCustomData ? <span class="badge accent">{t('badge.custom')}</span> : null}
        {hasUnverifiedValues ? <span class="badge warning">{t('badge.unverified')}</span> : null}
      </div>
      <p class="headline-value">
        <Money value={plan.netMonthly} />
      </p>
      {yearChange === null ? null : (
        <p class="muted small">{t('calc.headline.yearChange', { change: signedChange, year: yearChange.previousYear })}</p>
      )}
      <p class="small">
        {t('calc.headline.grossLabel')} <Money value={grossEquivalent.grossWage} isApproximate={!grossEquivalent.isExact} />
      </p>
    </div>
  )
}
