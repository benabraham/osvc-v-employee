import type { Locale } from './types'

// Intl output uses U+202F (narrow no-break space) in some locales; the app shows U+00A0 everywhere
const NARROW_NO_BREAK_SPACE = / /g
const NO_BREAK_SPACE = ' '

/** Intl locale tag for each UI locale. */
const intlLocaleFor = (locale: Locale): string => (locale === 'cs' ? 'cs-CZ' : 'en-GB')

/** Money formatters are created once: they run on every keystroke. */
const moneyFormatters: Record<Locale, Intl.NumberFormat> = {
  cs: new Intl.NumberFormat(intlLocaleFor('cs'), { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat(intlLocaleFor('en'), { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }),
}

const dateFormatters: Record<Locale, Intl.DateTimeFormat> = {
  cs: new Intl.DateTimeFormat(intlLocaleFor('cs'), { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' }),
  en: new Intl.DateTimeFormat(intlLocaleFor('en'), { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
}

const normaliseSpaces = (text: string): string => text.replace(NARROW_NO_BREAK_SPACE, NO_BREAK_SPACE)

/**
 * Rounds to whole crowns, ties away from zero (like Sheets ROUND and the reference library),
 * and never returns -0.
 *
 * @param {number} value
 * @returns {number}
 */
const roundToWhole = (value: number): number => {
  const magnitude = Math.round(Math.abs(value))
  return value < 0 && magnitude !== 0 ? -magnitude : magnitude
}

/**
 * Formats an amount in whole crowns: cs "39 700 Kč", en "CZK 39,700".
 * Rounds half away from zero first, as the calculation sheet does.
 *
 * @param {number} value amount in Kč
 * @param {Locale} locale
 * @returns {string}
 */
export const formatMoney = (value: number, locale: Locale): string =>
  normaliseSpaces(moneyFormatters[locale].format(roundToWhole(value)))

/**
 * Formats a plain number with the locale's separators: cs "1 234,57", en "1,234.57".
 *
 * @param {number} value
 * @param {{ locale: Locale, maximumFractionDigits?: number }} options fraction digits default to 0
 * @returns {string}
 */
export const formatNumber = (value: number, { locale, maximumFractionDigits = 0 }: { locale: Locale; maximumFractionDigits?: number }): string =>
  normaliseSpaces(new Intl.NumberFormat(intlLocaleFor(locale), { maximumFractionDigits }).format(value))

/**
 * Formats a share as a percentage with one decimal: cs "15,9 %", en "15.9%".
 *
 * @param {number} share fraction, 0.159 for 15.9 %
 * @param {Locale} locale
 * @returns {string}
 */
export const formatPercent = (share: number, locale: Locale): string =>
  normaliseSpaces(
    new Intl.NumberFormat(intlLocaleFor(locale), {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(share),
  )

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Formats an ISO calendar date (YYYY-MM-DD) without any time-zone shift: cs "1. 1. 2026", en "1 Jan 2026".
 * Text that is not a real calendar date is returned unchanged.
 *
 * @param {string} isoDate
 * @param {Locale} locale
 * @returns {string}
 */
export const formatDate = (isoDate: string, locale: Locale): string => {
  const match = ISO_DATE_PATTERN.exec(isoDate)
  if (!match) return isoDate
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, monthIndex, day))
  const isRealDate = date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex && date.getUTCDate() === day
  if (!isRealDate) return isoDate
  return normaliseSpaces(dateFormatters[locale].format(date))
}

const SPACE_GROUPED_NUMBER_PATTERN = /^[+-]?\d{1,3}(?:[   ]\d{3})+(?:[.,]\d+)?$/
const SPACE_CHARACTERS = /[   ]/g
const DIGITS_AND_SEPARATORS_PATTERN = /^\d+(?:[.,]\d+)*$/

/**
 * Parses a number typed by a user, without the sign and spaces.
 * One `,` or `.` is the decimal separator ("1,5" and "1.5" are 1.5).
 * Several separators must be thousands groups of three digits, optionally followed by one decimal separator
 * of the other kind ("1.234,5", "1,234.5", "1 234 567").
 *
 * @param {string} unsigned digits and separators only
 * @param {number} sign -1 or 1
 * @returns {number | null}
 */
const parseDigitsAndSeparators = (unsigned: string, sign: number): number | null => {
  if (!DIGITS_AND_SEPARATORS_PATTERN.test(unsigned)) return null
  const separators = [...unsigned.replace(/\d/g, '')]
  const firstSeparator = separators[0]
  if (firstSeparator === undefined) return sign * Number(unsigned)
  if (separators.length === 1) return sign * Number(unsigned.replace(',', '.'))

  const isMixed = separators.some((separator) => separator !== firstSeparator)
  const decimalSeparator = isMixed ? separators[separators.length - 1] : undefined
  const thousandsSeparator = decimalSeparator === undefined ? firstSeparator : decimalSeparator === ',' ? '.' : ','
  const lastDecimalIndex = decimalSeparator === undefined ? -1 : unsigned.lastIndexOf(decimalSeparator)
  const integerText = lastDecimalIndex === -1 ? unsigned : unsigned.slice(0, lastDecimalIndex)
  const fractionText = lastDecimalIndex === -1 ? '' : unsigned.slice(lastDecimalIndex + 1)

  const groups = integerText.split(thousandsSeparator)
  const isThousandsGrouping = groups.every((group, index) => (index === 0 ? /^\d{1,3}$/ : /^\d{3}$/).test(group))
  if (!isThousandsGrouping) return null
  const integerDigits = groups.join('')
  return sign * Number(fractionText === '' ? integerDigits : `${integerDigits}.${fractionText}`)
}

/**
 * Reads a number typed into an input field, in either decimal convention and with spaces as group separators.
 * Returns null for empty or unreadable text, and for values that are not finite.
 *
 * @param {string} text what the user typed, e.g. "39 700", "1,5", "1.5"
 * @returns {number | null}
 */
export const parseNumberInput = (text: string): number | null => {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const hasSpaces = trimmed.search(SPACE_CHARACTERS) !== -1
  if (hasSpaces && !SPACE_GROUPED_NUMBER_PATTERN.test(trimmed)) return null

  const withoutSpaces = trimmed.replace(SPACE_CHARACTERS, '')
  const sign = withoutSpaces.startsWith('-') ? -1 : 1
  const unsigned = withoutSpaces.replace(/^[+-]/, '')
  const parsed = parseDigitsAndSeparators(unsigned, sign)
  return parsed !== null && Number.isFinite(parsed) ? parsed : null
}
