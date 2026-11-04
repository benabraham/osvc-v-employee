import { results, useT } from '../../app/context'
import { BenefitsCalculator } from './benefits-calculator'
import { SicknessInsuranceCard } from './sickness-insurance-card'
import { registerBundle } from '../../app/context'
import { benefitsMessages } from '../../i18n/messages/benefits'

registerBundle(benefitsMessages)

/**
 * The benefits screen (#/benefits): sickness, maternity and paternity benefit for an employee and an OSVČ with the
 * same income, and who qualifies for each. Its inputs are kept only while the screen is open, never stored.
 */
export const BenefitsScreen = () => {
  const t = useT()
  const current = results.value
  return (
    <section class="stack" aria-labelledby="benefits-title">
      <h1 id="benefits-title">{t('benefits.title')}</h1>
      <p>{t('benefits.intro')}</p>
      {current ? (
        <>
          <SicknessInsuranceCard results={current} />
          {/* a new year or a switched insurance prefills the inputs again */}
          <BenefitsCalculator key={`${current.year}-${current.sicknessInsurance.enabled}`} results={current} />
        </>
      ) : (
        <div class="notice">
          <p>{t('benefits.noData')}</p>
        </div>
      )}
    </section>
  )
}
