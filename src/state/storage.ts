/**
 * Reads and writes the persisted state through a Storage-like object (in the app, window.localStorage).
 * Every access is wrapped in try/catch: a private window or blocked site data must not break the app.
 */
import { initialState, normalizeState, type PersistedState } from './schema'

/** Key of the persisted state. The version in the key changes only when the storage format is replaced outright. */
export const STORAGE_KEY = 'osvc-v-employee:v1'

/** The part of the Storage interface the app uses, so tests can pass a fake. */
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

/**
 * Loads the persisted state. Missing, unreadable, corrupted or unknown-version data gives the initial state.
 *
 * @param {object} params
 * @param {StorageLike} params.storage
 * @param {Date} params.today
 * @returns {PersistedState}
 */
export const loadState = ({ storage, today }: { storage: StorageLike; today: Date }): PersistedState => {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return initialState({ today })
    return normalizeState(JSON.parse(raw), { today })
  } catch {
    return initialState({ today })
  }
}

/**
 * Writes the whole state. A failed write (quota, blocked storage) is reported as false and never thrown.
 *
 * @param {object} params
 * @param {StorageLike} params.storage
 * @param {PersistedState} params.state
 * @returns {boolean} whether the write succeeded
 */
export const saveState = ({ storage, state }: { storage: StorageLike; state: PersistedState }): boolean => {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/**
 * A Storage-like object that keeps values in memory only. Used when the browser gives no localStorage
 * (no window, or access is blocked), so the app still works for the session.
 *
 * @returns {StorageLike}
 */
export const createMemoryStorage = (): StorageLike => {
  const entries = new Map<string, string>()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => void entries.set(key, value),
  }
}
