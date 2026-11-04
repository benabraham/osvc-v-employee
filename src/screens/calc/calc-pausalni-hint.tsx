import { useT } from '../../app/context'
import type { Results } from '../../model'
import { moneyText } from './calc-format'

/**
 * The paušální daň comparison as one line, like the sheet: the yearly saving or extra cost against the regular
 * levies, with the band it is based on. Above band 2 it says the regime is not available.
 *
 * @param {object} props
 * @param {Results} props.results
 */
export const CalcPausalniHint = ({ results }: { results: Results }) => {
  const t = useT()
  const { pausalniDanHint: hint } = results

  if (!hint.isAvailable) return <p class="calc-hint muted">{t('calc.pausal.unavailable')}</p>

  const sentence =
    hint.yearlySaving > 0
      ? t('calc.pausal.saving', { amount: moneyText(hint.yearlySaving) })
      : t('calc.pausal.cost', { amount: moneyText(-hint.yearlySaving) })

  return (
    <p class="calc-hint">
      {sentence} <span class="muted small">({t('calc.pausal.band', { band: hint.band ?? '' })})</span>
    </p>
  )
}
