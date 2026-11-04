import { effect } from '@preact/signals'
import type { JSX } from 'preact'
import { useEffect } from 'preact/hooks'
import { CalcScreen } from '../screens/calc/calc-screen'
import { SplitScreen } from '../screens/split/split-screen'
import './app.css'
import { lazyScreen } from './lazy-screen'
import { AppFooter } from './footer'
import { AppHeader } from './header'
import { useT, store } from './context'
import { AppNav } from './nav'
import { applyShellSettings, localeSetting, themeSetting } from './shell-state'
import { route, startRouting, type Route } from './router'
import { ToastHost } from './toast-host'
import { YearDataNotice } from './year-data-notice'

// Language and theme follow the store at once, before any screen renders in the new language
effect(() => applyShellSettings({ locale: localeSetting.value, theme: themeSetting.value }))

const lazyScreens = {
  costs: lazyScreen({ load: () => import('../screens/costs/costs-screen').then((module) => module.CostsScreen) }),
  scenarios: lazyScreen({ load: () => import('../screens/scenarios/scenarios-screen').then((module) => module.ScenariosScreen) }),
  reverse: lazyScreen({ load: () => import('../screens/reverse/reverse-screen').then((module) => module.ReverseScreen) }),
  benefits: lazyScreen({ load: () => import('../screens/benefits/benefits-screen').then((module) => module.BenefitsScreen) }),
  data: lazyScreen({ load: () => import('../screens/data/data-screen').then((module) => module.DataScreen) }),
  about: lazyScreen({ load: () => import('../screens/about/about-screen').then((module) => module.AboutScreen) }),
}

/** Loads the other screens once the browser is idle, so switching screens is instant. */
export const preloadScreens = () => Promise.all(Object.values(lazyScreens).map((screen) => screen.preload()))

/** The screen component of each route; the split and calculator screens ship in the initial bundle. */
const SCREENS: Record<Route, () => JSX.Element> = {
  split: SplitScreen,
  calc: CalcScreen,
  costs: lazyScreens.costs.Screen,
  scenarios: lazyScreens.scenarios.Screen,
  reverse: lazyScreens.reverse.Screen,
  benefits: lazyScreens.benefits.Screen,
  data: lazyScreens.data.Screen,
  about: lazyScreens.about.Screen,
}

/** Screens that do not depend on the tax year's values, so they get no year notice. */
const SCREENS_WITHOUT_YEAR_NOTICE: readonly Route[] = ['about', 'data']

/**
 * The app shell: a skip link, the header, the navigation, the active screen, the footer, and the messages.
 * The active screen comes from the `route` signal, which the hash sets.
 */
export const App = () => {
  const t = useT()
  const current = route.value
  const ActiveScreen = SCREENS[current]
  const title = `${t(`nav.${current}`)} · ${t('app.name')}`

  useEffect(() => startRouting({ store }), [])
  useEffect(() => {
    const idle = globalThis.requestIdleCallback ?? ((callback: () => void) => setTimeout(callback, 1_500))
    idle(() => void preloadScreens())
  }, [])
  useEffect(() => {
    document.title = title
  }, [title])

  return (
    <>
      <a
        class="skip-link"
        href="#main"
        onClick={(event) => {
          // the hash drives routing, so focus the main region instead of navigating to #main
          event.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        {t('shell.skip')}
      </a>
      <AppHeader />
      <div class="app-layout">
        <AppNav current={current} />
        <main id="main" class="app-main" tabIndex={-1}>
          {SCREENS_WITHOUT_YEAR_NOTICE.includes(current) ? null : <YearDataNotice />}
          <ActiveScreen />
        </main>
      </div>
      <AppFooter />
      <ToastHost />
    </>
  )
}
