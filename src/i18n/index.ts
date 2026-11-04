import type { Locale, MessageBundle } from './types'

export type { Locale, MessageBundle } from './types'
export { formatDate, formatMoney, formatNumber, formatPercent, parseNumberInput } from './format'

/** Values for `{name}` placeholders in a message. */
export type MessageParams = Readonly<Record<string, string | number>>

/** Looks up a message by its dotted key and fills in its placeholders. */
export type Translator = (key: string, params?: MessageParams) => string

type Dictionary = Record<string, string>

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g

/**
 * Own-property lookup, so keys such as "constructor" never hit Object.prototype.
 *
 * @param {Dictionary} dictionary
 * @param {string} key
 * @returns {string | undefined}
 */
const lookup = (dictionary: Dictionary, key: string): string | undefined =>
  Object.hasOwn(dictionary, key) ? dictionary[key] : undefined

/**
 * Replaces each `{name}` that has a param; placeholders without one stay visible.
 *
 * @param {string} template
 * @param {MessageParams} [params]
 * @returns {string}
 */
const fillPlaceholders = (template: string, params: MessageParams | undefined): string =>
  params === undefined
    ? template
    : template.replace(PLACEHOLDER_PATTERN, (placeholder, name: string) =>
        Object.hasOwn(params, name) ? String(params[name]) : placeholder,
      )

/**
 * Returns the first key that is defined by more than one dictionary, if any.
 *
 * @param {readonly string[]} keys
 * @returns {string | undefined}
 */
const findDuplicateKey = (keys: readonly string[]): string | undefined => {
  const seen = new Set<string>()
  return keys.find((key) => {
    if (seen.has(key)) return true
    seen.add(key)
    return false
  })
}

/**
 * Joins the dictionaries of one locale. In development a key defined twice throws, so a second
 * feature cannot silently overwrite a message of the first.
 *
 * @param {readonly Dictionary[]} dictionaries
 * @param {Locale} locale used in the error message
 * @returns {Dictionary}
 */
const mergeDictionaries = (dictionaries: readonly Dictionary[], locale: Locale): Dictionary => {
  const duplicateKey = findDuplicateKey(dictionaries.flatMap((dictionary) => Object.keys(dictionary)))
  if (import.meta.env.DEV && duplicateKey !== undefined) {
    throw new Error(`Message key "${duplicateKey}" is defined twice in the ${locale} bundles`)
  }
  return Object.assign({}, ...dictionaries)
}

/**
 * Combines feature bundles into one bundle. Throws in development when two bundles define the same key.
 *
 * @param {...MessageBundle} bundles
 * @returns {MessageBundle}
 */
export const mergeBundles = (...bundles: readonly MessageBundle[]): MessageBundle => ({
  cs: mergeDictionaries(bundles.map((bundle) => bundle.cs), 'cs'),
  en: mergeDictionaries(bundles.map((bundle) => bundle.en), 'en'),
})

/**
 * Creates `t(key, params)` for one locale. A missing English message falls back to Czech,
 * a missing Czech message falls back to the key itself.
 *
 * @param {{ locale: Locale, bundles: readonly MessageBundle[] }} options
 * @returns {Translator}
 */
export const createTranslator = ({ locale, bundles }: { locale: Locale; bundles: readonly MessageBundle[] }): Translator => {
  const merged = mergeBundles(...bundles)
  return (key, params) => {
    const template = lookup(merged[locale], key) ?? lookup(merged.cs, key) ?? key
    return fillPlaceholders(template, params)
  }
}
