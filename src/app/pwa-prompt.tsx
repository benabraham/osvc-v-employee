import { useEffect } from 'preact/hooks'
import { showToast } from './toast'

/**
 * The service worker state the prompt needs. `ServiceWorkerPrompt` (pwa-register.tsx) fills it from the
 * PWA plugin's hook; keeping the type here lets the prompt be tested without the plugin.
 */
export type ServiceWorkerState = {
  /** a new version is waiting to take over */
  needRefresh: boolean
  setNeedRefresh: (value: boolean) => void
  /** the app has been cached and works offline */
  offlineReady: boolean
  setOfflineReady: (value: boolean) => void
  /** activates the waiting version; with `true` the page reloads */
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>
}

/**
 * Turns the service worker state into messages: a new version offers a reload, and the first offline-ready state
 * is announced once. Renders nothing; the messages go through the toast queue.
 *
 * @param {object} props
 * @param {ServiceWorkerState} props.registration
 */
export const PwaPrompt = ({ registration }: { registration: ServiceWorkerState }) => {
  const { needRefresh, setNeedRefresh, offlineReady, setOfflineReady, updateServiceWorker } = registration

  useEffect(() => {
    if (!needRefresh) return
    showToast({
      messageKey: 'update.available',
      actions: [{ labelKey: 'update.reload', run: () => void updateServiceWorker(true) }],
      onDismiss: () => setNeedRefresh(false),
    })
  }, [needRefresh])

  useEffect(() => {
    if (!offlineReady) return
    showToast({ messageKey: 'offline.ready', onDismiss: () => setOfflineReady(false) })
  }, [offlineReady])

  return null
}
