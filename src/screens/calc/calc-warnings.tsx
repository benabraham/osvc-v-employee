import { useT } from '../../app/context'
import type { Translator } from '../../i18n'
import type { Results, WarningCode } from '../../model'
import { moneyText } from './calc-format'

/**
 * The text of one warning. The model names the code; the words live in the messages.
 *
 * @param {object} params
 * @param {WarningCode} params.code
 * @param {Translator} params.t
 * @param {Results} params.results
 * @param {number} params.minimumWage monthly minimum wage of the year
 * @returns {string}
 */
const warningTextFor = ({
  code,
  t,
  results,
  minimumWage,
}: {
  code: WarningCode
  t: Translator
  results: Results
  minimumWage: number
}): string => {
  if (code === 'aboveScope') return t('calc.warning.aboveScope')
  if (code === 'grossBelowMinimumWage') {
    return t('calc.warning.grossBelowMinimumWage', {
      gross: moneyText(results.grossEquivalent.grossWage),
      minimumWage: moneyText(minimumWage),
    })
  }
  if (code === 'pausalniDanAboveBand') return t('calc.warning.pausalniDanAboveBand')
  return t('calc.warning.childBonusNotEligible')
}

/**
 * The inline notices for inputs outside the model's range (PRD "Behaviour"). They never block input.
 *
 * @param {object} props
 * @param {Results} props.results
 * @param {number} props.minimumWage monthly minimum wage of the year
 */
export const CalcWarnings = ({ results, minimumWage }: { results: Results; minimumWage: number }) => {
  const t = useT()
  if (results.warnings.length === 0) return null
  return (
    <ul class="calc-warnings">
      {results.warnings.map((code) => (
        <li key={code} class="notice warning">
          <p>{warningTextFor({ code, t, results, minimumWage })}</p>
        </li>
      ))}
    </ul>
  )
}
