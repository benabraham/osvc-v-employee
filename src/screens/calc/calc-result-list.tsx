import { useT } from '../../app/context'
import type { Inputs, Results } from '../../model'
import { Money, ResultRow } from '../../ui'
import { moneyText, numberText, percentText, shareOfInvoiced } from './calc-format'

/**
 * Joins the short notes of one row ("upraveno · daňový bonus") into one line.
 *
 * @param {string[]} notes
 * @returns {string | undefined} undefined when there is nothing to show
 */
const joinNotes = (notes: string[]): string | undefined => (notes.length === 0 ? undefined : notes.join(' · '))

/**
 * The detailed calculation: every intermediate value from the invoiced amount to the net per day, in the order
 * of the sheet (PRD "Calculation rules"). Overridden values are marked; under paušální daň the levies it covers are
 * noted as included.
 *
 * @param {object} props
 * @param {Results} props.results
 * @param {Inputs} props.inputs
 */
export const CalcResultList = ({ results, inputs }: { results: Results; inputs: Inputs }) => {
  const t = useT()
  const { plan, percentages, pausalniDan, sicknessInsurance, costsPerYear } = results
  const { usesPausalniDan } = inputs
  const isTotalOverridden = inputs.overrides.totalLevies !== null
  const isCostsOverridden = inputs.overrides.taxDeductibleCosts !== null
  const overrideBadge = t('calc.override.badge')
  const inPausalNote = usesPausalniDan ? t('calc.result.inPausal') : undefined
  const incomeTaxNotes = joinNotes([
    ...(plan.incomeTax < 0 ? [t('calc.result.bonusNote')] : []),
    ...(inPausalNote ? [inPausalNote] : []),
  ])
  const shareNote = (amount: number) => t('calc.result.share', { percent: percentText(shareOfInvoiced({ amount, invoiced: plan.invoiced })) })

  return (
    <section class="card" aria-labelledby="calc-result-heading">
      <h2 id="calc-result-heading">{t('calc.result.heading')}</h2>
      <dl class="result-list">
        <ResultRow label={t('calc.result.invoiced')}>
          <Money value={plan.invoiced} />
        </ResultRow>
        <ResultRow
          label={t('calc.result.taxDeductibleCosts')}
          note={joinNotes([shareNote(plan.taxDeductibleCosts), ...(isCostsOverridden ? [overrideBadge] : [])])}
        >
          <Money value={plan.taxDeductibleCosts} />
        </ResultRow>
        <ResultRow label={t('calc.result.taxBase')}>
          <Money value={plan.taxBase} />
        </ResultRow>
        <ResultRow label={t('calc.result.incomeTax')} note={incomeTaxNotes}>
          <Money value={plan.incomeTax} />
        </ResultRow>
        <ResultRow label={t('calc.result.health')} note={inPausalNote}>
          <Money value={plan.healthInsurance} />
        </ResultRow>
        <ResultRow label={t('calc.result.social')} note={inPausalNote}>
          <Money value={plan.socialInsurance} />
        </ResultRow>
        <ResultRow label={t('calc.result.sickness')}>
          <Money value={sicknessInsurance.yearlyPremium} />
        </ResultRow>
        {usesPausalniDan ? (
          <ResultRow label={t('calc.result.pausalTotal')}>
            <Money value={pausalniDan.yearlyAmount} />
          </ResultRow>
        ) : null}
        <ResultRow
          label={t('calc.result.totalLevies')}
          note={joinNotes([
            t('calc.result.levyShare', { percent: percentText(percentages.levies) }),
            ...(isTotalOverridden ? [overrideBadge] : []),
          ])}
        >
          <Money value={plan.totalLevies} />
        </ResultRow>
        <ResultRow label={t('calc.result.afterTax')}>
          <Money value={plan.afterTax} />
        </ResultRow>
        <ResultRow label={t('calc.result.costs')} note={shareNote(costsPerYear)}>
          <Money value={costsPerYear} />
        </ResultRow>
        <ResultRow label={t('calc.result.afterTaxAndCosts')}>
          <Money value={plan.afterTaxAndCosts} />
        </ResultRow>
        <ResultRow label={t('calc.result.calculationDays')} note={t('calc.result.calculationDaysNote')}>
          {numberText(plan.calculationDays)} {t('unit.days')}
        </ResultRow>
        <ResultRow label={t('calc.result.reserve')} note={shareNote(plan.reservePerYear)}>
          <Money value={plan.reservePerYear} />
        </ResultRow>
        <ResultRow label={t('calc.result.holiday')} note={shareNote(plan.holidayPerYear)}>
          <Money value={plan.holidayPerYear} />
        </ResultRow>
        <ResultRow label={t('calc.result.netYearly')}>
          <Money value={plan.netYearly} />
        </ResultRow>
        <ResultRow label={t('calc.result.netMonthly')} isTotal>
          <Money value={plan.netMonthly} />
        </ResultRow>
        <ResultRow label={t('calc.result.perDay')} note={t('calc.result.perDayNote')}>
          <Money value={plan.perDay} />
        </ResultRow>
      </dl>
    </section>
  )
}
