/** UI languages. Czech is the default and the fallback. */
export type Locale = 'cs' | 'en'

/**
 * Messages of one feature or of the whole app: dotted key → text, for each locale.
 * Both locales must list the same keys; `{name}` placeholders must match too.
 */
export type MessageBundle = {
  cs: Record<string, string>
  en: Record<string, string>
}
