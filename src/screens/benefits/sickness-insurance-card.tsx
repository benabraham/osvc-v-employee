import { useT } from '../../app/context'
import type { Results } from '../../model'
import { Money, ResultRow } from '../../ui'
import { osvcPremiumForBenefits } from './compare-benefits'

/**
 * Whether the OSVČ's voluntary sickness insurance is on in the calculation, its premium and base, and the link to
 * switch it on. Pensions are named only: OSVČ pensions are lower, and the app does not calculate them (PRD "Scope").
 *
 * @param {object} props
 * @param {Results} props.results the calculation of the active year
 */
export const SicknessInsuranceCard = ({ results }: { results: Results }) => {
  const t = useT()
  const isEnabled = results.sicknessInsurance.enabled
  const premium = osvcPremiumForBenefits({
    isEnabled,
    sicknessInsurance: results.sicknessInsurance,
    rates: results.rates.sicknessInsurance,
  })

  return (
    <section class="card stack" aria-labelledby="benefits-insurance-heading">
      <h2 id="benefits-insurance-heading">{t('benefits.insurance.heading')}</h2>
      <dl class="result-list">
        <ResultRow label={t('benefits.insurance.status')}>
          {isEnabled ? t('benefits.insurance.statusOn') : t('benefits.insurance.statusOff')}
        </ResultRow>
        <ResultRow label={t('benefits.insurance.premium')}>
          <Money value={premium.monthlyPremium} />
        </ResultRow>
        <ResultRow label={t('benefits.insurance.base')}>
          <Money value={premium.monthlyAssessmentBase} />
        </ResultRow>
      </dl>
      {isEnabled ? null : (
        <div class="notice">
          <p>{t('benefits.insurance.minimumNote')}</p>
          <p>
            <a href="#/calc">{t('benefits.insurance.enableLink')}</a>
          </p>
        </div>
      )}
      <p class="muted small">{t('benefits.pension.note')}</p>
    </section>
  )
}
