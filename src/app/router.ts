/**
 * Hash routing. A screen is `#/<route>`. `#/share/<token>` loads a shared calculation into the store, confirms it
 * and opens the calculator. The screen on show is the `route` signal; the hash parsing is pure, and `openHash`
 * applies a hash to a store.
 */
import { signal } from '@preact/signals'
import type { AppStore } from '../state/store'
import { parseShareHash } from '../state/share'
import { showToast } from './toast'

/** The screens, in navigation order. */
export const ROUTES = ['split', 'calc', 'costs', 'scenarios', 'reverse', 'benefits', 'data', 'about'] as const

export type Route = (typeof ROUTES)[number]

/** The screen on show. `openHash` and `navigate` set it. */
export const route = signal<Route>('calc')

const SHARE_HASH_PATTERN = /^#?\/share\//

/**
 * Whether a name is one of the screens.
 *
 * @param {string} name
 * @returns {name is Route}
 */
export const isRoute = (name: string): name is Route => (ROUTES as readonly string[]).includes(name)

/**
 * The screen a visitor sees when the hash names none: the invoice splitter once setup is complete, else the calculator.
 *
 * @param {object} params
 * @param {boolean} params.hasCompletedSetup
 * @returns {Route}
 */
export const defaultRouteFor = ({ hasCompletedSetup }: { hasCompletedSetup: boolean }): Route =>
  hasCompletedSetup ? 'split' : 'calc'

/**
 * Whether a hash is a share link (`#/share/<token>`, the # is optional).
 *
 * @param {string} hash
 * @returns {boolean}
 */
export const isShareHash = (hash: string): boolean => SHARE_HASH_PATTERN.test(hash)

/**
 * The screen a hash names. An empty, unknown or share hash gives the default screen.
 *
 * @param {object} params
 * @param {string} params.hash e.g. "#/costs"
 * @param {boolean} params.hasCompletedSetup
 * @returns {Route}
 */
export const routeFromHash = ({ hash, hasCompletedSetup }: { hash: string; hasCompletedSetup: boolean }): Route => {
  const name = hash.replace(/^#/, '').replace(/^\//, '').replace(/\/$/, '')
  return isRoute(name) ? name : defaultRouteFor({ hasCompletedSetup })
}

/**
 * Shows a screen and writes its hash, so the address bar and the screen agree.
 *
 * @param {Route} target
 */
export const navigate = (target: Route): void => {
  route.value = target
  if (typeof window === 'undefined') return
  const hash = `#/${target}`
  if (window.location.hash !== hash) window.location.hash = hash
}

/**
 * Loads a share link: the calculation goes into the store, the calculator opens and a confirmation shows.
 * A broken link leaves the store alone and opens the default screen with a message.
 */
const openSharedLink = ({ hash, store }: { hash: string; store: AppStore }): void => {
  const shared = parseShareHash(hash)
  if (!shared) {
    showToast({ messageKey: 'shell.share.invalid' })
    navigate(defaultRouteFor({ hasCompletedSetup: store.state.peek().hasCompletedSetup }))
    return
  }
  store.applySharedCalculation(shared)
  showToast({ messageKey: 'shell.share.loaded' })
  navigate('calc')
}

/**
 * Applies a hash: a share link loads its calculation, anything else shows the screen it names.
 *
 * @param {object} params
 * @param {string} params.hash the URL hash
 * @param {AppStore} params.store
 */
export const openHash = ({ hash, store }: { hash: string; store: AppStore }): void => {
  if (isShareHash(hash)) {
    openSharedLink({ hash, store })
    return
  }
  route.value = routeFromHash({ hash, hasCompletedSetup: store.state.peek().hasCompletedSetup })
}

/**
 * Applies the current hash now and again on every hash change.
 *
 * @param {object} params
 * @param {AppStore} params.store
 * @returns {() => void} stops listening
 */
export const startRouting = ({ store }: { store: AppStore }): (() => void) => {
  const handleHashChange = () => openHash({ hash: window.location.hash, store })
  handleHashChange()
  window.addEventListener('hashchange', handleHashChange)
  return () => window.removeEventListener('hashchange', handleHashChange)
}
