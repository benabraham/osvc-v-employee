import { useT } from '../../app/context'
import type { Results } from '../../model'
import { Disclosure, Money, ResultRow } from '../../ui'

/**
 * The employee's side of the comparison: the gross salary that gives the same net, with its payroll breakdown
 * (PRD "Behaviour", gross salary). Collapsed by default; the gross is an estimate because of the rounding steps.
 *
 * @param {object} props
 * @param {Results} props.results
 */
export const CalcGrossBreakdown = ({ results }: { results: Results }) => {
  const t = useT()
  const { grossEquivalent } = results
  const isApproximate = !grossEquivalent.isExact
  const totalCredits = grossEquivalent.creditsTotal + grossEquivalent.childCredit

  return (
    <Disclosure summary={<h2 class="calc-summary-title">{t('calc.gross.heading')}</h2>}>
      <dl class="result-list">
        <ResultRow label={t('calc.gross.gross')}>
          <Money value={grossEquivalent.grossWage} isApproximate={isApproximate} />
        </ResultRow>
        <ResultRow label={t('calc.gross.socialEmployee')}>
          <Money value={grossEquivalent.employeeSocialInsurance} />
        </ResultRow>
        <ResultRow label={t('calc.gross.healthEmployee')}>
          <Money value={grossEquivalent.employeeHealthInsurance} />
        </ResultRow>
        {grossEquivalent.employeeSicknessInsurance > 0 ? (
          <ResultRow label={t('calc.gross.sicknessEmployee')}>
            <Money value={grossEquivalent.employeeSicknessInsurance} />
          </ResultRow>
        ) : null}
        <ResultRow label={t('calc.gross.taxAdvance')}>
          <Money value={grossEquivalent.taxAfterChildCredit} />
        </ResultRow>
        <ResultRow label={t('calc.gross.credits')} note={t('calc.gross.creditsNote')}>
          <Money value={totalCredits} />
        </ResultRow>
        {grossEquivalent.childBonus > 0 ? (
          <ResultRow label={t('calc.gross.bonus')}>
            <Money value={grossEquivalent.childBonus} />
          </ResultRow>
        ) : null}
        <ResultRow label={t('calc.gross.net')} isTotal>
          <Money value={grossEquivalent.netWage} />
        </ResultRow>
      </dl>
      <p class="field-help">{t('calc.gross.note')}</p>
    </Disclosure>
  )
}
