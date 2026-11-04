import { effect } from '@preact/signals'
import type { JSX } from 'preact'
import { useEffect } from 'preact/hooks'
import { AboutScreen } from '../screens/about/about-screen'
import { BenefitsScreen } from '../screens/benefits/benefits-screen'
import { CalcScreen } from '../screens/calc/calc-screen'
import { CostsScreen } from '../screens/costs/costs-screen'
import { DataScreen } from '../screens/data/data-screen'
import { ReverseScreen } from '../screens/reverse/reverse-screen'
import { ScenariosScreen } from '../screens/scenarios/scenarios-screen'
import { SplitScreen } from '../screens/split/split-screen'
import './app.css'
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

/** The screen component of each route. */
const SCREENS: Record<Route, () => JSX.Element> = {
  split: SplitScreen,
  calc: CalcScreen,
  costs: CostsScreen,
  scenarios: ScenariosScreen,
  reverse: ReverseScreen,
  benefits: BenefitsScreen,
  data: DataScreen,
  about: AboutScreen,
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
    document.title = title
  }, [title])

  return (
    <>
      <a class="skip-link" href="#main">
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
