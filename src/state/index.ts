/**
 * The app state: the persisted schema, storage, the store with its signals, share links and file helpers.
 * `getAppStore()` is the one store the app uses; tests and other callers create their own with `createStore`.
 */
import { createMemoryStorage, type StorageLike } from './storage'
import { createStore, type AppStore } from './store'

export * from './files'
export * from './id'
export * from './schema'
export * from './share'
export * from './storage'
export * from './store'

let appStore: AppStore | undefined

/**
 * The browser's localStorage when there is one, otherwise memory only (no window, or access is blocked).
 *
 * @returns {StorageLike}
 */
const browserStorage = (): StorageLike => {
  if (typeof window === 'undefined') return createMemoryStorage()
  try {
    return window.localStorage ?? createMemoryStorage()
  } catch {
    return createMemoryStorage()
  }
}

/**
 * The app's store, created on first use with the browser's storage and today's date.
 *
 * @returns {AppStore}
 */
export const getAppStore = (): AppStore => {
  if (!appStore) appStore = createStore({ storage: browserStorage(), today: new Date() })
  return appStore
}
