/**
 * Store values the shell reads, as narrow computed signals, so a component re-renders only when its value changes
 * (not on every keystroke), and the page settings that language and theme drive.
 */
import { computed } from '@preact/signals'
import type { Locale, Theme } from '../state/schema'
import { currentLocale } from '../ui/locale'
import { store } from './context'

/** The active tax year. */
export const activeYear = computed(() => store.state.value.activeYear)

/** The UI language chosen in the header. */
export const localeSetting = computed(() => store.state.value.locale)

/** The theme chosen in the header: system, light or dark. */
export const themeSetting = computed(() => store.state.value.theme)

/**
 * Puts the language and theme on the page: the locale for the shared components, `<html lang>`, and
 * `data-theme` (removed for the system theme, so the CSS media query decides).
 *
 * @param {object} params
 * @param {Locale} params.locale
 * @param {Theme} params.theme
 * @param {HTMLElement} [params.root] the <html> element; the document's by default
 */
export const applyShellSettings = ({ locale, theme, root }: { locale: Locale; theme: Theme; root?: HTMLElement }): void => {
  currentLocale.value = locale
  const element = root ?? (typeof document === 'undefined' ? undefined : document.documentElement)
  if (!element) return
  element.lang = locale
  if (theme === 'system') {
    element.removeAttribute('data-theme')
    return
  }
  element.setAttribute('data-theme', theme)
}
