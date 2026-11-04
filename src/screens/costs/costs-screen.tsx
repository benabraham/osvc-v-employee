/**
 * The costs screen (PRD user story 3, replaces the sheet's "náklady" tab): the list of business costs with their
 * price and months of amortisation, the yearly amount each adds up to, and the total that the calculation takes.
 * Deleting a row can be undone for five seconds; there is no confirmation dialog.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { results, store, useT } from '../../app/context'
import { formatMoney, formatPercent } from '../../i18n/format'
import { costsPerYearFor, type CostItem } from '../../model'
import { currentLocale, ResultRow } from '../../ui'
import { CostRow } from './cost-row'
import './costs.css'
import { registerBundle } from '../../app/context'
import { costsMessages } from '../../i18n/messages/costs'

registerBundle(costsMessages)

/** How long a deleted row can be restored. */
const UNDO_WINDOW_MS = 5_000

/** The last deleted row, where it stood, and whether it has been put back. */
type Removal = { cost: CostItem; index: number; phase: 'removed' | 'restored' }

/**
 * The costs list, the add button, the undo notice and the total per year with its share of the invoiced income.
 * The share needs the year's data; without it only the total is shown.
 */
export const CostsScreen = () => {
  const t = useT()
  const locale = currentLocale.value
  const { costs } = store.activeInputs.value
  const current = results.value
  const [removal, setRemoval] = useState<Removal | null>(null)
  const [focusCostId, setFocusCostId] = useState<string | null>(null)
  const undoButton = useRef<HTMLButtonElement>(null)

  // the undo window closes by itself
  useEffect(() => {
    if (removal === null) return
    const timer = setTimeout(() => setRemoval(null), UNDO_WINDOW_MS)
    return () => clearTimeout(timer)
  }, [removal])

  // after a delete the undo button is the next thing to act on, so the focus moves there and is not lost
  useLayoutEffect(() => {
    if (removal?.phase === 'removed') undoButton.current?.focus()
  }, [removal])

  const addRow = () => {
    setFocusCostId(store.addCost())
  }

  const deleteRow = ({ cost, index }: { cost: CostItem; index: number }) => {
    store.removeCost(cost.id)
    setRemoval({ cost, index, phase: 'removed' })
  }

  const restoreRow = (deleted: Removal) => {
    store.updateInputs((inputs) => ({
      ...inputs,
      costs: [...inputs.costs.slice(0, deleted.index), deleted.cost, ...inputs.costs.slice(deleted.index)],
    }))
    setRemoval({ ...deleted, phase: 'restored' })
    setFocusCostId(deleted.cost.id)
  }

  const removedName = removal?.cost.name.trim() ? removal.cost.name : t('costs.row.unnamed')
  const statusText =
    removal?.phase === 'removed'
      ? t('costs.undo.deleted', { name: removedName })
      : removal?.phase === 'restored'
        ? t('costs.undo.restored')
        : ''
  const total = costsPerYearFor({ costs })

  return (
    <section class="costs-screen">
      <h1>{t('costs.title')}</h1>
      <p class="muted">{t('costs.help')}</p>

      <div class="row costs-toolbar">
        <button type="button" class="button" onClick={addRow}>
          {t('costs.add')}
        </button>
      </div>

      <div class="costs-undo">
        <p class="costs-undo-status" role="status">
          {statusText}
        </p>
        {removal?.phase === 'removed' ? (
          <button ref={undoButton} type="button" class="button ghost small" onClick={() => restoreRow(removal)}>
            {t('costs.undo.restore')}
          </button>
        ) : null}
      </div>

      {costs.length === 0 ? (
        <p class="muted">{t('costs.empty')}</p>
      ) : (
        <div class="cost-list">
          {costs.map((cost, index) => (
            <CostRow
              key={cost.id}
              cost={cost}
              number={index + 1}
              shouldFocusName={cost.id === focusCostId}
              onChange={(patch) => store.updateCost(cost.id, patch)}
              onDelete={() => deleteRow({ cost, index })}
            />
          ))}
        </div>
      )}

      <section class="card costs-total" aria-live="polite">
        <dl class="result-list">
          <ResultRow label={t('costs.total')} isTotal>
            {formatMoney(total, locale)}
          </ResultRow>
          {current === null ? null : (
            <ResultRow label={t('costs.share')}>{formatPercent(current.percentages.costs, locale)}</ResultRow>
          )}
        </dl>
      </section>
    </section>
  )
}
