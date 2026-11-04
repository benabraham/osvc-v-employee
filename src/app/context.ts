/**
 * App-wide wiring the screens share: the store, the translator for the current language, and the results
 * of the active year as computed signals (recomputed only when inputs or year data change).
 */
import { computed, signal } from '@preact/signals'
import { TAX_YEARS } from '../data/tax-years'
import { createTranslator, type MessageBundle, type Translator } from '../i18n'
import { initialBundles } from '../i18n/messages'
import { computeResults, yearOnYearChangeFor } from '../model'
import { getAppStore } from '../state'
import { currentLocale } from '../ui/locale'

/** The single app store (localStorage-backed). */
export const store = getAppStore()

const translators = new Map<string, Translator>()

/** Bundles registered by lazily loaded screens; a change re-creates the translators. */
const lateBundles = signal<readonly MessageBundle[]>([])

/**
 * Adds the messages of a lazily loaded screen. Call it at the top of the screen module.
 *
 * @param {MessageBundle} bundle
 */
export const registerBundle = (bundle: MessageBundle) => {
  if (lateBundles.peek().includes(bundle)) return
  translators.clear()
  lateBundles.value = [...lateBundles.peek(), bundle]
}

/**
 * The translator for the current language. Calling it inside a component subscribes the component to
 * language changes. Usage: `const t = useT(); t('nav.split')`.
 *
 * @returns {Translator}
 */
export const useT = (): Translator => {
  const locale = currentLocale.value
  const bundles = [...initialBundles, ...lateBundles.value]
  const cached = translators.get(locale)
  if (cached) return cached
  const translator = createTranslator({ locale, bundles })
  translators.set(locale, translator)
  return translator
}

/** Results of the active year, or null when the year has no data (official or custom). */
export const results = computed(() => {
  const data = store.activeYearData.value
  if (!data) return null
  return computeResults({ inputs: store.activeInputs.value, data })
})

/** Net monthly difference against the previous year for the same inputs, or null without data. */
export const yearOnYearChange = computed(() => {
  const data = store.activeYearData.value
  if (!data) return null
  return yearOnYearChangeFor({ inputs: store.activeInputs.value, data, previousData: TAX_YEARS[data.year - 1] })
})
