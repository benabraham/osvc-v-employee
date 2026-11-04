/**
 * Saves the current calculation (the active year and its inputs) as a named scenario. The name is suggested from
 * the rate and the year until the user types their own.
 */
import { useState } from 'preact/hooks'
import { store, useT } from '../../app/context'
import { formatNumber } from '../../i18n'
import { currentLocale } from '../../ui'

/**
 * The save form of the scenarios screen.
 *
 * @returns {preact.JSX.Element}
 */
export const SaveScenarioForm = () => {
  const t = useT()
  const locale = currentLocale.value
  const { hourlyRate } = store.activeInputs.value
  const year = store.state.value.activeYear
  const suggestedName = t('scenarios.defaultName', { rate: formatNumber(hourlyRate, { locale }), year })
  const [typedName, setTypedName] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string | null>(null)
  const name = typedName ?? suggestedName
  const canSave = name.trim() !== ''

  return (
    <section class="card" aria-labelledby="save-scenario-title">
      <h2 id="save-scenario-title">{t('scenarios.save.heading')}</h2>
      <form
        class="stack"
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSave) return
          const scenario = store.saveScenario(name.trim())
          setTypedName(null)
          setSavedName(scenario.name)
        }}
      >
        <div class="field field-text">
          <label for="scenario-name">{t('scenarios.save.nameLabel')}</label>
          <div class="field-control">
            <input
              id="scenario-name"
              type="text"
              autoComplete="off"
              value={name}
              onInput={(event) => setTypedName(event.currentTarget.value)}
            />
          </div>
        </div>
        <div class="row">
          <button type="submit" class="button" disabled={!canSave}>
            {t('scenarios.save.button')}
          </button>
        </div>
        <p class="small" role="status">
          {savedName === null ? null : t('scenarios.save.saved', { name: savedName })}
        </p>
      </form>
    </section>
  )
}
