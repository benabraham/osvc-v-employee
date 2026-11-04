import { store, useT } from '../../app/context'
import type { Inputs, Results } from '../../model'
import { NumberField } from '../../ui'
import { moneyText } from './calc-format'

/**
 * The reserve: months of reserve a year, with the costs per year from the costs list (read-only here) and a link
 * to the list where they are edited.
 *
 * @param {object} props
 * @param {Inputs} props.inputs
 * @param {Results} props.results
 */
export const CalcReserveCard = ({ inputs, results }: { inputs: Inputs; results: Results }) => {
  const t = useT()
  return (
    <section class="card" aria-labelledby="calc-reserve-heading">
      <h2 id="calc-reserve-heading">{t('calc.reserve.heading')}</h2>
      <div class="stack">
        <NumberField
          id="calc-reserve-months"
          label={t('calc.reserve.months')}
          value={inputs.reserveMonths}
          onValue={(reserveMonths) => store.setInput('reserveMonths', reserveMonths)}
          unit={t('unit.months')}
          help={t('calc.reserve.help')}
          maximumFractionDigits={1}
          min={0}
          max={12}
        />
        <p class="small muted calc-costs-line">
          {t('calc.reserve.costs', { amount: moneyText(results.costsPerYear) })} · <a href="#/costs">{t('calc.reserve.costsLink')}</a>
        </p>
      </div>
    </section>
  )
}
