import { useRegisterSW } from 'virtual:pwa-register/preact'
import { PwaPrompt } from './pwa-prompt'

/**
 * Registers the service worker (vite-plugin-pwa, `registerType: 'prompt'`) and shows its messages.
 * The only module that imports the plugin's virtual module, so the rest of the shell can be tested without it.
 * Rendered next to `App` in main.tsx.
 */
export const ServiceWorkerPrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW()
  return (
    <PwaPrompt
      registration={{ needRefresh, setNeedRefresh, offlineReady, setOfflineReady, updateServiceWorker }}
    />
  )
}
