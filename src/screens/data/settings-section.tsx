import { store, useT } from '../../app/context'
import { Segmented, Toggle } from '../../ui'
import type { Locale, Theme } from '../../state'

/**
 * Settings kept in the store: whether the years share one set of inputs, the language and the theme.
 * The shell applies the language and the theme to the page.
 */
export const SettingsSection = () => {
  const t = useT()
  const { syncInputs, locale, theme } = store.state.value

  return (
    <section class="card stack" aria-labelledby="data-settings-heading">
      <h2 id="data-settings-heading">{t('data.settings.heading')}</h2>
      <Toggle
        id="data-sync-inputs"
        label={t('data.settings.syncLabel')}
        help={t('data.settings.syncHelp')}
        checked={syncInputs}
        onChange={(isOn) => store.setSyncInputs(isOn)}
      />
      <Segmented<Locale>
        name="data-language"
        legend={t('language.label')}
        options={[
          { value: 'cs', label: t('language.cs') },
          { value: 'en', label: t('language.en') },
        ]}
        value={locale}
        onChange={(value) => store.setLocale(value)}
      />
      <Segmented<Theme>
        name="data-theme"
        legend={t('theme.label')}
        options={[
          { value: 'system', label: t('theme.system') },
          { value: 'light', label: t('theme.light') },
          { value: 'dark', label: t('theme.dark') },
        ]}
        value={theme}
        onChange={(value) => store.setTheme(value)}
      />
    </section>
  )
}
