import { store, useT } from '../../app/context'
import type { TaxYearData } from '../../data/tax-years'
import type { Inputs } from '../../model'
import { NumberField, Toggle } from '../../ui'
import type { CalcFeatures } from './calc-features'
import { moneyText } from './calc-format'
import { withChildRemoved, withChildAdded, withChildUpdated } from './calc-updates'

/**
 * The children the child credit is claimed for: months, ZTP/P card and, from 2027, preschool fees, each child with
 * its own remove button. The monthly credit amounts by position are in the help text.
 *
 * @param {object} props
 * @param {Inputs} props.inputs
 * @param {TaxYearData} props.data
 * @param {CalcFeatures} props.features
 */
export const CalcChildrenFields = ({
  inputs,
  data,
  features,
}: {
  inputs: Inputs
  data: TaxYearData
  features: CalcFeatures
}) => {
  const t = useT()
  const { childCreditsMonthly } = data.incomeTax
  const creditHelp = t('calc.credits.childCreditHelp', {
    first: moneyText(childCreditsMonthly.first),
    second: moneyText(childCreditsMonthly.second),
    third: moneyText(childCreditsMonthly.thirdAndMore),
  })

  return (
    <div class="stack">
      {inputs.children.length === 0 ? <p class="muted small">{t('calc.credits.childrenNone')}</p> : null}
      {inputs.children.map((child, index) => {
        const number = index + 1
        return (
          <div key={index} class="calc-child" role="group" aria-label={t('calc.credits.childLegend', { number })}>
            <NumberField
              id={`calc-child-${index}-months`}
              label={t('calc.credits.childMonths')}
              value={child.months}
              onValue={(months) => store.updateInputs(withChildUpdated({ index, patch: { months } }))}
              unit={t('unit.months')}
              help={t('calc.credits.childMonthsHelp')}
              min={0}
              max={12}
            />
            <Toggle
              id={`calc-child-${index}-ztp`}
              label={t('calc.credits.childZtp')}
              checked={child.hasZtpP}
              onChange={(hasZtpP) => store.updateInputs(withChildUpdated({ index, patch: { hasZtpP } }))}
              help={t('calc.credits.childZtpHelp')}
            />
            {features.hasPreschoolFees ? (
              <NumberField
                id={`calc-child-${index}-preschool`}
                label={t('calc.credits.childPreschool')}
                value={child.preschoolFees}
                onValue={(preschoolFees) => store.updateInputs(withChildUpdated({ index, patch: { preschoolFees } }))}
                unit={t('unit.czk')}
                help={t('calc.credits.childPreschoolHelp')}
                min={0}
              />
            ) : null}
            <div>
              <button
                type="button"
                class="button ghost small"
                aria-label={t('calc.credits.childRemove', { number })}
                onClick={() => store.updateInputs(withChildRemoved(index))}
              >
                {t('calc.credits.childRemoveButton')}
              </button>
            </div>
          </div>
        )
      })}
      <p class="field-help">{creditHelp}</p>
      <div>
        <button type="button" class="button secondary small" onClick={() => store.updateInputs(withChildAdded)}>
          {t('calc.credits.addChild')}
        </button>
      </div>
    </div>
  )
}
