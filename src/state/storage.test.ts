import { describe, expect, it } from 'vitest'
import { defaultInputs } from '../model/inputs'
import { initialState } from './schema'
import { loadState, saveState, STORAGE_KEY } from './storage'

const today = new Date(2026, 10, 4, 10, 0, 0)

/** A Map-backed Storage: enough of the interface for the code under test. */
const fakeStorage = (entries: Record<string, string> = {}) => {
  const map = new Map(Object.entries(entries))
  return { map, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value) }
}

const throwingStorage = () => ({
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
})

describe('storage key', () => {
  it('is osvc-v-employee:v1', () => {
    expect(STORAGE_KEY).toBe('osvc-v-employee:v1')
  })
})

describe('loadState and saveState', () => {
  it('returns the initial state when nothing is stored', () => {
    expect(loadState({ storage: fakeStorage(), today })).toEqual(initialState({ today }))
  })

  it('round-trips a saved state', () => {
    const storage = fakeStorage()
    const state = { ...initialState({ today }), locale: 'en' as const, sharedInputs: { ...defaultInputs(), hourlyRate: 800 } }
    expect(saveState({ storage, state })).toBe(true)
    expect(storage.map.has('osvc-v-employee:v1')).toBe(true)
    expect(loadState({ storage, today })).toEqual(state)
  })

  it('returns the initial state for corrupted JSON without throwing', () => {
    expect(loadState({ storage: fakeStorage({ [STORAGE_KEY]: '{"version": 1, "locale": ' }), today })).toEqual(initialState({ today }))
  })

  it('returns the initial state for JSON that is not an object', () => {
    expect(loadState({ storage: fakeStorage({ [STORAGE_KEY]: '"text"' }), today })).toEqual(initialState({ today }))
    expect(loadState({ storage: fakeStorage({ [STORAGE_KEY]: 'null' }), today })).toEqual(initialState({ today }))
  })

  it('returns the initial state for a stored version this build does not know', () => {
    const stored = JSON.stringify({ ...initialState({ today }), version: 2, locale: 'en' })
    expect(loadState({ storage: fakeStorage({ [STORAGE_KEY]: stored }), today })).toEqual(initialState({ today }))
  })

  it('returns the initial state when reading storage throws', () => {
    expect(loadState({ storage: throwingStorage(), today })).toEqual(initialState({ today }))
  })

  it('returns false and does not throw when writing storage fails', () => {
    expect(saveState({ storage: throwingStorage(), state: initialState({ today }) })).toBe(false)
  })

  it('keeps other keys in the same storage untouched', () => {
    const storage = fakeStorage({ other: 'value' })
    saveState({ storage, state: initialState({ today }) })
    expect(storage.map.get('other')).toBe('value')
  })
})
