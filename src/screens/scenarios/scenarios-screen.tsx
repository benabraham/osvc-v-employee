/**
 * Scenarios screen (story 8): save the current calculation under a name, manage the saved scenarios and compare
 * them with the current calculation side by side.
 */
import './scenarios.css'
import { results, store, useT } from '../../app/context'
import { bestColumnIdsFor, comparisonColumnsFor } from './scenario-results'
import { SaveScenarioForm } from './save-scenario-form'
import { ScenarioComparison } from './scenario-comparison'
import { ScenarioList } from './scenario-list'
import { registerBundle } from '../../app/context'
import { scenariosMessages } from '../../i18n/messages/scenarios'

registerBundle(scenariosMessages)

/**
 * The scenarios screen. The first comparison column is the current calculation; the list shows the rest.
 *
 * @returns {preact.JSX.Element}
 */
export const ScenariosScreen = () => {
  const t = useT()
  const { scenarios, activeYear } = store.state.value
  const columns = comparisonColumnsFor({
    current: {
      id: 'current',
      name: t('scenarios.compare.current'),
      year: activeYear,
      inputs: store.activeInputs.value,
      results: results.value,
    },
    scenarios,
  })
  const savedColumns = columns.slice(1)
  const bestIds = bestColumnIdsFor({ columns })

  return (
    <section class="scenarios-screen" aria-labelledby="scenarios-title">
      <h1 id="scenarios-title">{t('scenarios.title')}</h1>
      <p class="muted">{t('scenarios.intro')}</p>

      <SaveScenarioForm />

      {scenarios.length === 0 ? (
        <section class="card" aria-labelledby="scenarios-empty-title">
          <h2 id="scenarios-empty-title">{t('scenarios.empty.title')}</h2>
          <p>{t('scenarios.empty.text')}</p>
        </section>
      ) : (
        <>
          <ScenarioList columns={savedColumns} />
          <ScenarioComparison columns={columns} bestIds={bestIds} />
        </>
      )}
    </section>
  )
}
