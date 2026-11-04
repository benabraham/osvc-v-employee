import { useState } from 'preact/hooks'
import { store, useT } from '../../app/context'
import { initialState } from '../../state'

/**
 * Deletes everything the app keeps on this device, after an inline confirmation. Nothing is undone afterwards.
 */
export const ResetSection = () => {
  const t = useT()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)

  const deleteAll = () => {
    store.state.value = initialState({ today: new Date() })
    setIsConfirming(false)
    setIsDeleted(true)
  }

  return (
    <section class="card stack" aria-labelledby="data-reset-heading">
      <h2 id="data-reset-heading">{t('data.reset.heading')}</h2>
      <p class="muted">{t('data.reset.explain')}</p>
      {isConfirming ? (
        <div class="notice warning" role="group" aria-label={t('data.reset.confirm')}>
          <p>{t('data.reset.confirm')}</p>
          <div class="row">
            <button type="button" class="button danger" onClick={deleteAll}>
              {t('action.delete')}
            </button>
            <button type="button" class="button secondary" onClick={() => setIsConfirming(false)}>
              {t('action.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div class="row">
          <button type="button" class="button danger" onClick={() => setIsConfirming(true)}>
            {t('data.reset.button')}
          </button>
        </div>
      )}
      <p role="status">{isDeleted ? t('data.reset.done') : ''}</p>
    </section>
  )
}
