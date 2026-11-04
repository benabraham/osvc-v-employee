/**
 * The saved scenarios with their actions: rename (inline), load into the calculation, delete.
 */
import { useEffect, useState } from 'preact/hooks'
import { store, useT } from '../../app/context'
import { formatMoney } from '../../i18n'
import { currentLocale } from '../../ui'
import type { ComparisonColumn } from './scenario-results'

/**
 * The name of one scenario as an inline text field. Changes are saved when the field is left or Enter is pressed;
 * a blank name is refused and the previous one comes back.
 *
 * @param {object} props
 * @param {string} props.id scenario id
 * @param {string} props.name the saved name
 */
const ScenarioNameField = ({ id, name }: { id: string; name: string }) => {
  const t = useT()
  const [draft, setDraft] = useState(name)
  useEffect(() => setDraft(name), [name])

  return (
    <div class="field field-text">
      <div class="field-control">
        <input
          type="text"
          autoComplete="off"
          value={draft}
          aria-label={t('scenarios.rename.label', { name })}
          onInput={(event) => setDraft(event.currentTarget.value)}
          onChange={(event) => {
            const nextName = event.currentTarget.value.trim()
            if (nextName === '') {
              event.currentTarget.value = name
              setDraft(name)
              return
            }
            if (nextName !== name) store.renameScenario(id, nextName)
          }}
        />
      </div>
    </div>
  )
}

/**
 * One saved scenario: its name, a summary of its result, and the load and delete buttons.
 *
 * @param {object} props
 * @param {ComparisonColumn} props.column the scenario as a comparison column (its results are computed there)
 */
const ScenarioRow = ({ column }: { column: ComparisonColumn }) => {
  const t = useT()
  const locale = currentLocale.value
  const summary = column.results
    ? t('scenarios.list.summary', { year: column.year, netMonthly: formatMoney(column.results.plan.netMonthly, locale) })
    : t('scenarios.list.noData', { year: column.year })

  return (
    <li class="scenario-row">
      <ScenarioNameField id={column.id} name={column.name} />
      <p class="small muted">{summary}</p>
      <div class="row">
        <button
          type="button"
          class="button secondary small"
          aria-label={t('scenarios.load.label', { name: column.name })}
          onClick={() => {
            store.loadScenario(column.id)
            window.location.hash = '#/calc'
          }}
        >
          {t('scenarios.load.button')}
        </button>
        <button
          type="button"
          class="button danger small"
          aria-label={t('scenarios.delete.label', { name: column.name })}
          onClick={() => store.deleteScenario(column.id)}
        >
          {t('scenarios.delete.button')}
        </button>
      </div>
    </li>
  )
}

/**
 * The list of saved scenarios.
 *
 * @param {object} props
 * @param {ComparisonColumn[]} props.columns the saved scenarios, in the order they were saved
 */
export const ScenarioList = ({ columns }: { columns: ComparisonColumn[] }) => {
  const t = useT()
  return (
    <section class="card" aria-labelledby="scenario-list-title">
      <h2 id="scenario-list-title">{t('scenarios.list.heading')}</h2>
      <ul class="scenario-list">
        {columns.map((column) => (
          <ScenarioRow key={column.id} column={column} />
        ))}
      </ul>
    </section>
  )
}
