import { useT } from './context'
import { CloseIcon } from './icons'
import { dismissToast, toasts } from './toast'

/**
 * Draws the toast queue. The region is always in the page so screen readers announce new messages.
 */
export const ToastHost = () => {
  const t = useT()
  return (
    <div class="toast-stack" aria-live="polite">
      {toasts.value.map((toast) => (
        <div class="toast" key={toast.id}>
          <span class="toast-message">{t(toast.messageKey, toast.params)}</span>
          {toast.actions?.map((action) => (
            <button
              key={action.labelKey}
              type="button"
              class="button small"
              onClick={() => {
                action.run()
                dismissToast(toast.id)
              }}
            >
              {t(action.labelKey)}
            </button>
          ))}
          <button type="button" class="icon-button" aria-label={t('action.close')} onClick={() => dismissToast(toast.id)}>
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  )
}
