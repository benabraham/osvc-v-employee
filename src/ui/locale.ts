import { signal } from '@preact/signals'
import type { Locale } from '../i18n/types'

/**
 * The UI language, read by the shared components. The app shell keeps it in sync with the store,
 * so components do not need the store to format money or numbers.
 */
export const currentLocale = signal<Locale>('cs')
