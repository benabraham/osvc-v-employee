import { store, useT } from '../../app/context'
import type { TaxYearData } from '../../data/tax-years'
import type { ExpenseRate } from '../../calc'
import type { Inputs, Results } from '../../model'
import { OverrideField, Segmented, Toggle, NumberField } from '../../ui'
import type { CalcFeatures } from './calc-features'
import { moneyText } from './calc-format'
import { withOverrides, withSicknessInsurance } from './calc-updates'

/** The flat-rate expense options, labelled with a non-breaking space before the percent sign. */
const EXPENSE_RATE_OPTIONS: { value: ExpenseRate; label: string }[] = [
  { value: 0.3, label: '30 %' },
  { value: 0.4, label: '40 %' },
  { value: 0.6, label: '60 %' },
  { value: 0.8, label: '80 %' },
]

/**
 * State and levies: paušální daň with its surcharge, the expense rate, the new-OSVČ switch, the two overridable
 * values (tax-deductible costs, total levies) and the voluntary sickness insurance.
 *
 * @param {object} props
 * @param {Inputs} props.inputs
 * @param {TaxYearData} props.data
 * @param {Results} props.results
 * @param {CalcFeatures} props.features
 */
export const CalcStateCard = ({
  inputs,
  data,
  results,
  features,
}: {
  inputs: Inputs
  data: TaxYearData
  results: Results
  features: CalcFeatures
}) => {
  const t = useT()
  const { sicknessInsurance } = results
  const minimumSicknessBase = 'minimumMonthlyAssessmentBase' in sicknessInsurance ? sicknessInsurance.minimumMonthlyAssessmentBase : 0
  const isSicknessBaseDefault = inputs.sicknessInsurance.monthlyAssessmentBase === null

  return (
    <section class="card" aria-labelledby="calc-state-heading">
      <h2 id="calc-state-heading">{t('calc.state.heading')}</h2>
      <div class="stack">
        <Toggle
          id="calc-uses-pausalni-dan"
          label={t('calc.state.pausal')}
          checked={inputs.usesPausalniDan}
          onChange={(usesPausalniDan) => store.setInput('usesPausalniDan', usesPausalniDan)}
          help={t('calc.state.pausalHelp')}
        />
        {inputs.usesPausalniDan && features.hasSalesRegistrationSurcharge ? (
          <Toggle
            id="calc-sales-registration-surcharge"
            label={t('calc.state.surcharge')}
            checked={inputs.withSalesRegistrationSurcharge}
            onChange={(on) => store.setInput('withSalesRegistrationSurcharge', on)}
            help={t('calc.state.surchargeHelp', { amount: moneyText(data.salesRegistrationSurcharge ?? 0) })}
          />
        ) : null}
        <div class="field">
          <Segmented
            name="calc-expense-rate"
            legend={t('calc.state.expenseRate')}
            options={EXPENSE_RATE_OPTIONS}
            value={inputs.expenseRate}
            onChange={(expenseRate) => store.setInput('expenseRate', expenseRate)}
          />
          <p class="field-help">{t('calc.state.expenseRateHelp')}</p>
        </div>
        <Toggle
          id="calc-new-osvc"
          label={t('calc.state.isNewOsvc')}
          checked={inputs.isNewOsvc}
          onChange={(isNewOsvc) => store.setInput('isNewOsvc', isNewOsvc)}
          help={t('calc.state.isNewOsvcHelp')}
        />
        <OverrideField
          id="calc-tax-deductible-costs"
          label={t('calc.state.taxDeductibleCosts')}
          help={t('calc.state.taxDeductibleCostsHelp')}
          unit={t('unit.czk')}
          min={0}
          calculatedValue={results.calculatedPlan.taxDeductibleCosts}
          overrideValue={inputs.overrides.taxDeductibleCosts}
          onOverride={(value) => store.updateInputs(withOverrides({ taxDeductibleCosts: value }))}
          onReset={() => store.resetOverride('taxDeductibleCosts')}
          overriddenLabel={t('calc.override.badge')}
          resetLabel={t('calc.override.reset')}
        />
        <Toggle
          id="calc-sickness-insurance"
          label={t('calc.state.sickness')}
          checked={inputs.sicknessInsurance.enabled}
          onChange={(enabled) => store.updateInputs(withSicknessInsurance({ enabled }))}
          help={t('calc.state.sicknessHelp')}
        />
        {inputs.sicknessInsurance.enabled ? (
          <NumberField
            id="calc-sickness-base"
            label={t('calc.state.sicknessBase')}
            value={sicknessInsurance.monthlyAssessmentBase}
            onValue={(base) => store.updateInputs(withSicknessInsurance({ monthlyAssessmentBase: base }))}
            unit={t('unit.czk')}
            help={t('calc.state.sicknessBaseHelp', {
              minimum: moneyText(minimumSicknessBase),
              premium: moneyText(sicknessInsurance.monthlyPremium),
            })}
            min={0}
            after={
              isSicknessBaseDefault ? null : (
                <button
                  type="button"
                  class="button ghost small"
                  onClick={() => store.updateInputs(withSicknessInsurance({ monthlyAssessmentBase: null }))}
                >
                  {t('calc.state.sicknessBaseReset')}
                </button>
              )
            }
          />
        ) : null}
        <OverrideField
          id="calc-total-levies"
          label={t('calc.state.totalLevies')}
          help={t('calc.state.totalLeviesHelp')}
          unit={t('unit.czk')}
          min={0}
          calculatedValue={results.calculatedPlan.totalLevies}
          overrideValue={inputs.overrides.totalLevies}
          onOverride={(value) => store.updateInputs(withOverrides({ totalLevies: value }))}
          onReset={() => store.resetOverride('totalLevies')}
          overriddenLabel={t('calc.override.badge')}
          resetLabel={t('calc.override.reset')}
        />
      </div>
    </section>
  )
}
