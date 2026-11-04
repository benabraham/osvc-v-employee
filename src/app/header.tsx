import { LOCALES, THEMES, type Locale, type Theme } from '../state/schema'
import { store, useT } from './context'
import { localeSetting, themeSetting } from './shell-state'
import { YearSwitcher } from './year-switcher'

/** Two buttons, one per language; the current one is pressed. Each button says the language in full to screen readers. */
const LanguageToggle = () => {
  const t = useT()
  const locale = localeSetting.value
  return (
    <div class="lang-toggle" role="group" aria-label={t('language.label')}>
      {LOCALES.map((option: Locale) => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-label={t(`language.${option}`)}
          aria-pressed={option === locale}
          onClick={() => store.setLocale(option)}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** The theme select: system, light or dark. */
const ThemeSelect = () => {
  const t = useT()
  return (
    <div class="field header-field">
      <label for="theme-select">{t('theme.label')}</label>
      <div class="field-control">
        <select
          id="theme-select"
          value={themeSetting.value}
          onChange={(event) => {
            const value = (event.currentTarget as HTMLSelectElement).value
            if (isTheme(value)) store.setTheme(value)
          }}
        >
          {THEMES.map((theme) => (
            <option key={theme} value={theme}>
              {t(`theme.${theme}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

const isTheme = (value: string): value is Theme => (THEMES as readonly string[]).includes(value)

/**
 * The page header: the app name as the site title, the tax-year switcher, the language and the theme.
 */
export const AppHeader = () => {
  const t = useT()
  return (
    <header class="app-header">
      <p class="app-title">{t('app.name')}</p>
      <YearSwitcher />
      <LanguageToggle />
      <ThemeSelect />
    </header>
  )
}
