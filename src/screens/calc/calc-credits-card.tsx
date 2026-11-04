import { store, useT } from '../../app/context'
import type { TaxYearData } from '../../data/tax-years'
import type { DisabilityDegree, Inputs, Results } from '../../model'
import { Disclosure, NumberField, Segmented, Toggle } from '../../ui'
import { CalcChildrenFields } from './calc-children-fields'
import { CalcDeductionFields } from './calc-deduction-fields'
import type { CalcFeatures } from './calc-features'
import { moneyText } from './calc-format'
import { withCredits } from './calc-updates'

/**
 * Tax credits and deductions, collapsed by default as the PRD asks. The summary shows the credits and deductions
 * that apply; under paušální daň they are not used and the card says so.
 *
 * @param {object} props
 * @param {Inputs} props.inputs
 * @param {TaxYearData} props.data
 * @param {Results} props.results
 * @param {CalcFeatures} props.features
 */
export const CalcCreditsCard = ({
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
  const { credits } = inputs
  const { incomeTax } = data
  const { incomeTaxDetail } = results.plan
  // credits the tax can absorb, plus the child credit (the part above the tax is paid out as the bonus)
  const creditsApplied = Math.min(incomeTaxDetail.creditsTotal, incomeTaxDetail.taxBeforeCredits) + incomeTaxDetail.childCredit
  const summaryText = inputs.usesPausalniDan
    ? t('calc.credits.notUsed')
    : t('calc.credits.summary', {
        credits: moneyText(creditsApplied),
        deductions: moneyText(incomeTaxDetail.deductionsTotal),
      })

  const disabilityOptions: { value: DisabilityDegree; label: string }[] = [
    { value: 'none', label: t('calc.credits.disabilityNone') },
    { value: 'degree1or2', label: t('calc.credits.disabilityDegree1or2') },
    { value: 'degree3', label: t('calc.credits.disabilityDegree3') },
  ]

  const summary = (
    <h2 class="calc-summary-title">
      {t('calc.credits.heading')} <span class="calc-summary-text small muted">{summaryText}</span>
    </h2>
  )

  return (
    <section class="card">
      <Disclosure summary={summary}>
        {inputs.usesPausalniDan ? <p class="notice warning">{t('calc.credits.pausalNotice')}</p> : null}
        <h3>{t('calc.credits.children')}</h3>
        <CalcChildrenFields inputs={inputs} data={data} features={features} />
        <Toggle
          id="calc-spouse-credit"
          label={t('calc.credits.spouse')}
          checked={credits.spouse}
          onChange={(spouse) => store.updateInputs(withCredits({ spouse }))}
          help={t('calc.credits.spouseHelp', { amount: moneyText(incomeTax.spouseCredit) })}
        />
        {credits.spouse ? (
          <Toggle
            id="calc-spouse-ztp"
            label={t('calc.credits.spouseZtp')}
            checked={credits.spouseHasZtpP}
            onChange={(spouseHasZtpP) => store.updateInputs(withCredits({ spouseHasZtpP }))}
            help={t('calc.credits.spouseZtpHelp')}
          />
        ) : null}
        <div class="field">
          <Segmented
            name="calc-disability"
            legend={t('calc.credits.disability')}
            options={disabilityOptions}
            value={credits.disability}
            onChange={(disability) => store.updateInputs(withCredits({ disability }))}
          />
          <p class="field-help">
            {t('calc.credits.disabilityHelp', {
              degree1or2: moneyText(incomeTax.disabilityDegree1or2Credit),
              degree3: moneyText(incomeTax.disabilityDegree3Credit),
            })}
          </p>
        </div>
        <Toggle
          id="calc-ztp-holder"
          label={t('calc.credits.ztpHolder')}
          checked={credits.ztpHolder}
          onChange={(ztpHolder) => store.updateInputs(withCredits({ ztpHolder }))}
          help={t('calc.credits.ztpHolderHelp', { amount: moneyText(incomeTax.ztpHolderCredit) })}
        />
        {features.hasStudentCredit ? (
          <NumberField
            id="calc-student-months"
            label={t('calc.credits.studentMonths')}
            value={credits.studentMonths}
            onValue={(studentMonths) => store.updateInputs(withCredits({ studentMonths }))}
            unit={t('unit.months')}
            help={t('calc.credits.studentHelp', { amount: moneyText(incomeTax.studentCredit ?? 0) })}
            min={0}
            max={12}
          />
        ) : null}
        {features.hasSalesRegistrationCredit ? (
          <Toggle
            id="calc-first-year-sales-registration"
            label={t('calc.credits.salesRegistration')}
            checked={credits.isFirstYearWithRegisteredSales}
            onChange={(isFirstYearWithRegisteredSales) => store.updateInputs(withCredits({ isFirstYearWithRegisteredSales }))}
            help={t('calc.credits.salesRegistrationHelp', { amount: moneyText(incomeTax.salesRegistrationCredit ?? 0) })}
          />
        ) : null}
        <CalcDeductionFields inputs={inputs} data={data} />
      </Disclosure>
    </section>
  )
}
