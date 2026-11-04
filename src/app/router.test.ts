// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { encodeSharedCalculation } from '../state/share'
import { createStore } from '../state/store'
import { createMemoryStorage } from '../state/storage'
import { initialState } from '../state/schema'
import { defaultInputs } from '../model/inputs'
import { defaultRouteFor, isRoute, isShareHash, openHash, route, routeFromHash, startRouting } from './router'
import { toasts } from './toast'

const today = new Date('2026-11-04')

const storeWith = (state = initialState({ today })) => {
  const store = createStore({ storage: createMemoryStorage(), today })
  store.state.value = state
  return store
}

describe('routeFromHash', () => {
  it('opens the calculator without a hash before setup, and the splitter after it', () => {
    expect(routeFromHash({ hash: '', hasCompletedSetup: false })).toBe('calc')
    expect(routeFromHash({ hash: '', hasCompletedSetup: true })).toBe('split')
  })

  it('reads each screen from its hash, with or without the leading #', () => {
    expect(routeFromHash({ hash: '#/costs', hasCompletedSetup: false })).toBe('costs')
    expect(routeFromHash({ hash: '/scenarios', hasCompletedSetup: false })).toBe('scenarios')
    expect(routeFromHash({ hash: '#/about/', hasCompletedSetup: false })).toBe('about')
  })

  it('gives the default screen for unknown names and for a share link', () => {
    expect(routeFromHash({ hash: '#/unknown', hasCompletedSetup: true })).toBe('split')
    expect(routeFromHash({ hash: '#/share/abc', hasCompletedSetup: false })).toBe('calc')
    expect(routeFromHash({ hash: '#/Costs', hasCompletedSetup: false })).toBe('calc')
  })
})

describe('route helpers', () => {
  it('knows the eight screens and nothing else', () => {
    const names = ['split', 'calc', 'costs', 'scenarios', 'reverse', 'benefits', 'data', 'about']
    expect(names.every(isRoute)).toBe(true)
    expect(isRoute('share')).toBe(false)
  })

  it('chooses the default screen from the setup flag', () => {
    expect(defaultRouteFor({ hasCompletedSetup: true })).toBe('split')
    expect(defaultRouteFor({ hasCompletedSetup: false })).toBe('calc')
  })

  it('recognises share hashes with or without the leading #', () => {
    expect(isShareHash('#/share/eyJ')).toBe(true)
    expect(isShareHash('/share/eyJ')).toBe(true)
    expect(isShareHash('#/sharing')).toBe(false)
    expect(isShareHash('#/calc')).toBe(false)
  })
})

describe('openHash', () => {
  beforeEach(() => {
    location.hash = ''
    toasts.value = []
    route.value = 'calc'
  })

  afterEach(() => {
    location.hash = ''
    toasts.value = []
  })

  it('sets the screen named by the hash', () => {
    openHash({ hash: '#/reverse', store: storeWith() })
    expect(route.value).toBe('reverse')
  })

  it('loads a valid share link into the store, shows the confirmation and opens the calculator', () => {
    const store = storeWith()
    const token = encodeSharedCalculation({ year: 2025, inputs: { ...defaultInputs(), hourlyRate: 800 } })
    location.hash = `#/share/${token}`

    openHash({ hash: `#/share/${token}`, store })

    expect(store.state.value.activeYear).toBe(2025)
    expect(store.activeInputs.value.hourlyRate).toBe(800)
    expect(route.value).toBe('calc')
    expect(location.hash).toBe('#/calc')
    expect(toasts.value.map((toast) => toast.messageKey)).toEqual(['shell.share.loaded'])
  })

  it('leaves the store alone for a broken share link and goes to the default screen', () => {
    const store = storeWith()
    const before = store.state.value

    openHash({ hash: '#/share/!!!', store })

    expect(store.state.value).toBe(before)
    expect(route.value).toBe('calc')
    expect(toasts.value.map((toast) => toast.messageKey)).toEqual(['shell.share.invalid'])
  })
})

describe('startRouting', () => {
  beforeEach(() => {
    location.hash = ''
    route.value = 'calc'
  })

  afterEach(() => {
    location.hash = ''
  })

  it('follows hash changes until it is stopped', async () => {
    const store = storeWith()
    const stop = startRouting({ store })
    location.hash = '#/benefits'
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(route.value).toBe('benefits')

    stop()
    location.hash = '#/data'
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(route.value).toBe('benefits')
  })
})
