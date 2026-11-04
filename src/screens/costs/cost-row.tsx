/**
 * One row of the costs list (PRD user story 3): name, price, months of amortisation and the yearly amount they add up
 * to. On a phone it is a card; on a desktop it is one line of a grid. Every change goes out through `onChange`.
 */
import { useLayoutEffect, useRef } from 'preact/hooks'
import { useT } from '../../app/context'
import { formatMoney } from '../../i18n/format'
import { yearlyCostFor, type CostItem } from '../../model'
import { currentLocale, NumberField } from '../../ui'

/** Props of one cost row. */
export type CostRowProps = {
  cost: CostItem
  /** position in the list, counted from 1 */
  number: number
  /** true for the row just added or restored: its name input takes the focus */
  shouldFocusName: boolean
  onChange: (patch: Partial<Omit<CostItem, 'id'>>) => void
  onDelete: () => void
}

/**
 * A cost row. The delete button is labelled with the row's name, so each one is distinct for screen readers.
 * The yearly amount is read-only: the price spread over the months of amortisation (`yearlyCostFor`).
 *
 * @param {CostRowProps} props
 */
export const CostRow = ({ cost, number, shouldFocusName, onChange, onDelete }: CostRowProps) => {
  const t = useT()
  const locale = currentLocale.value
  const nameInput = useRef<HTMLInputElement>(null)
  const titleId = `cost-${cost.id}-title`
  const nameId = `cost-${cost.id}-name`
  const name = cost.name.trim() === '' ? t('costs.row.unnamed') : cost.name

  // layout effect: the focus moves in the same frame the row appears, so the next keystroke goes to the name
  useLayoutEffect(() => {
    if (shouldFocusName) nameInput.current?.focus()
  }, [shouldFocusName])

  return (
    <div class="cost-row" role="group" aria-labelledby={titleId}>
      <h3 id={titleId} class="cost-row-title">
        {t('costs.row.title', { number })}
      </h3>
      <div class="field field-text">
        <div class="row">
          <label for={nameId}>{t('costs.row.name')}</label>
        </div>
        <div class="field-control">
          <input
            id={nameId}
            ref={nameInput}
            type="text"
            autoComplete="off"
            value={cost.name}
            onInput={(event) => onChange({ name: (event.currentTarget as HTMLInputElement).value })}
          />
        </div>
      </div>
      <div class="cost-fields">
        <NumberField
          id={`cost-${cost.id}-price`}
          label={t('costs.row.price')}
          unit={t('unit.czk')}
          value={cost.price}
          min={0}
          onValue={(price) => onChange({ price })}
        />
        <NumberField
          id={`cost-${cost.id}-months`}
          label={t('costs.row.months')}
          unit={t('unit.months')}
          value={cost.months}
          min={1}
          onValue={(months) => onChange({ months })}
        />
      </div>
      <div class="cost-yearly">
        <span class="cost-yearly-label">{t('costs.row.yearly')}</span>
        <span class="cost-yearly-value">{formatMoney(yearlyCostFor({ cost }), locale)}</span>
      </div>
      <button type="button" class="button danger small cost-delete" aria-label={t('costs.row.delete', { name })} onClick={onDelete}>
        {t('action.delete')}
      </button>
    </div>
  )
}
