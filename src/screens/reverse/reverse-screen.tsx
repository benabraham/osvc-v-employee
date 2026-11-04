/**
 * Reverse screen (story 7): the net monthly income the user wants, and the hourly rate that reaches it with the
 * other settings of the active year. The target is kept on the screen only; applying the rate writes it to the
 * calculation.
 */
import { useMemo, useState } from 'preact/hooks'
import { results, store, useT } from '../../app/context'
import { formatMoney, formatNumber } from '../../i18n'
import { MAXIMUM_SEARCHED_HOURLY_RATE } from '../../model'
import { Money, NumberField, ResultRow, currentLocale } from '../../ui'
import { defaultTargetNetMonthlyFor, reverseSearchFor } from './reverse-target'
import './reverse.css'

/**
 * The reverse screen: target field, the result (live region) and the action that applies the rate.
 *
 * @returns {preact.JSX.Element}
 */
export const ReverseScreen = () => {
  const t = useT()
  const locale = currentLocale.value
  const inputs = store.activeInputs.value
  const data = store.activeYearData.value
  const year = store.state.value.activeYear
  const [target, setTarget] = useState(() => defaultTargetNetMonthlyFor({ netMonthly: results.value?.plan.netMonthly ?? 0 }))
  const search = useMemo(
    () => (data ? reverseSearchFor({ targetNetMonthly: target, inputs, data }) : null),
    [target, inputs, data],
  )

  const formatRate = (amount: number) => `${formatNumber(amount, { locale })} ${t('unit.czkPerHour')}`
  const canApply = search !== null && search.isReachable
  const isApplied = canApply && inputs.hourlyRate === search.hourlyRate
  const signOf = (value: number) => {
    if (value > 0) return '+'
    if (value < 0) return '−'
    return ''
  }
  const signedDifference = (difference: number) => `${signOf(difference)}${formatRate(Math.abs(difference))}`

  return (
    <section class="reverse-screen" aria-labelledby="reverse-title">
      <h1 id="reverse-title">{t('reverse.title')}</h1>
      <p class="muted">{t('reverse.intro')}</p>

      <div class="card">
        <NumberField
          id="reverse-target"
          label={t('reverse.target.label')}
          value={target}
          onValue={setTarget}
          unit={t('unit.czk')}
          help={t('reverse.target.help')}
          min={0}
        />
      </div>

      <section class="card" aria-labelledby="reverse-result-title">
        <h2 id="reverse-result-title">{t('reverse.result.title')}</h2>
        <div aria-live="polite" aria-atomic="true">
          {search === null ? (
            <p class="notice">{t('reverse.result.noData', { year })}</p>
          ) : !search.isReachable ? (
            <p class="notice warning">
              {t('reverse.result.unreachable', {
                rate: formatRate(MAXIMUM_SEARCHED_HOURLY_RATE),
                target: formatMoney(target, locale),
              })}
            </p>
          ) : (
            <>
              <div class="headline">
                <span class="headline-label">{t('reverse.result.rate')}</span>
                <span class="headline-value">{formatRate(search.hourlyRate)}</span>
              </div>
              <dl class="result-list">
                <ResultRow label={t('reverse.result.invoiced')}>
                  <Money value={search.invoiced} />
                </ResultRow>
                <ResultRow label={t('reverse.result.netMonthly')}>
                  <Money value={search.netMonthly} />
                </ResultRow>
                <ResultRow label={t('reverse.result.grossEquivalent')}>
                  <Money value={search.grossEquivalent} isApproximate />
                </ResultRow>
                <ResultRow label={t('reverse.result.currentRate')}>{formatRate(search.currentHourlyRate)}</ResultRow>
                <ResultRow label={t('reverse.result.difference')}>{signedDifference(search.difference)}</ResultRow>
              </dl>
            </>
          )}
        </div>

        <div class="row">
          <button
            type="button"
            class="button"
            disabled={!canApply}
            onClick={() => {
              if (search) store.setInput('hourlyRate', search.hourlyRate)
            }}
          >
            {t('reverse.apply')}
          </button>
          <a class="button secondary" href="#/calc">
            {t('reverse.openCalc')}
          </a>
        </div>
        <p class="small" role="status">
          {isApplied ? t('reverse.applied') : null}
        </p>
      </section>
    </section>
  )
}
