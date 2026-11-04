import { describe, expect, it } from 'vitest'
import { getAppStore } from './index'

describe('getAppStore', () => {
  it('returns the same store on every call', () => {
    expect(getAppStore()).toBe(getAppStore())
  })

  it('works without a window, keeping the state in memory', () => {
    const store = getAppStore()
    store.setLocale('en')
    expect(store.state.value.locale).toBe('en')
    expect(store.state.value.activeYear).toBe(new Date().getFullYear())
  })
})
