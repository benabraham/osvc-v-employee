import './calc.css'
import { results, store, useT, yearOnYearChange } from '../../app/context'
import { CalcBillingCard } from './calc-billing-card'
import { CalcCreditsCard } from './calc-credits-card'
import { type CalcFeatures, calcFeaturesFor } from './calc-features'
import { CalcGrossBreakdown } from './calc-gross-breakdown'
import { CalcHeadline } from './calc-headline'
import { CalcPausalniHint } from './calc-pausalni-hint'
import { CalcReserveCard } from './calc-reserve-card'
import { CalcResultList } from './calc-result-list'
import { CalcStateCard } from './calc-state-card'
import { CalcWarnings } from './calc-warnings'

/**
 * The calculator: inputs → net income, levies and the gross salary equivalent (PRD stories 1, 4, 5 and 6).
 * On a phone the headline comes first, then the inputs, then the detailed results. On a desktop the inputs are
 * on the left and the results on the right, where they stay in view while the inputs scroll.
 *
 * @returns {preact.JSX.Element}
 */
export const CalcScreen = () => {
  const t = useT()
  const currentResults = results.value
  const data = store.activeYearData.value
  if (!currentResults || !data) {
    return (
      <section class="calc-screen">
        <h1 class="visually-hidden">{t('calc.title')}</h1>
        <p class="muted">{t('calc.noData')}</p>
      </section>
    )
  }

  const inputs = store.activeInputs.value
  const change = yearOnYearChange.value
  const features: CalcFeatures = calcFeaturesFor({ data })
  const yearChange = change === null ? null : { difference: change.difference, previousYear: data.year - 1 }

  return (
    <section class="calc-screen">
      <h1 class="visually-hidden">{t('calc.title')}</h1>
      <div class="split-layout calc-layout">
        <div class="sticky-column calc-results">
          <div class="calc-headline-block">
            <CalcHeadline results={currentResults} yearChange={yearChange} isUsingCustomData={store.isUsingCustomData.value} />
            <CalcPausalniHint results={currentResults} />
            <CalcWarnings results={currentResults} minimumWage={data.minimumWage} />
          </div>
          <div class="calc-details">
            <CalcResultList results={currentResults} inputs={inputs} />
            <CalcGrossBreakdown results={currentResults} />
          </div>
        </div>
        <div class="calc-inputs">
          <CalcBillingCard inputs={inputs} data={data} results={currentResults} />
          <CalcStateCard inputs={inputs} data={data} results={currentResults} features={features} />
          <CalcCreditsCard inputs={inputs} data={data} results={currentResults} features={features} />
          <CalcReserveCard inputs={inputs} results={currentResults} />
        </div>
      </div>
    </section>
  )
}
