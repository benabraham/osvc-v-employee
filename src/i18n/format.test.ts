import { describe, expect, it } from 'vitest'
import { formatDate, formatMoney, formatNumber, formatPercent, parseNumberInput } from './format'
import type { Locale } from './types'

// The app shows U+00A0 group separators; Intl may return U+202F, which the formatters normalise
const NBSP = ' '

describe('formatMoney', () => {
  it.each<[number, Locale, string]>([
    [39700, 'cs', `39${NBSP}700${NBSP}Kč`],
    [1234.5, 'cs', `1${NBSP}235${NBSP}Kč`], // ties go away from zero
    [1234.4, 'cs', `1${NBSP}234${NBSP}Kč`],
    [0.4, 'cs', `0${NBSP}Kč`],
    [-0.4, 'cs', `0${NBSP}Kč`], // never "-0"
    [-2.5, 'cs', `-3${NBSP}Kč`],
    [39700, 'en', `CZK${NBSP}39,700`],
    [-39700, 'en', `-CZK${NBSP}39,700`],
    [0, 'en', `CZK${NBSP}0`],
  ])('formats %d for %s as %j', (value, locale, expected) => {
    expect(formatMoney(value, locale)).toBe(expected)
  })
})

describe('formatNumber', () => {
  it('uses the given fraction digits and the locale separators', () => {
    expect(formatNumber(1234.5678, { locale: 'cs', maximumFractionDigits: 2 })).toBe(`1${NBSP}234,57`)
    expect(formatNumber(1234.5678, { locale: 'en', maximumFractionDigits: 2 })).toBe('1,234.57')
  })

  it('defaults to whole numbers', () => {
    expect(formatNumber(12.7, { locale: 'cs' })).toBe('13')
  })
})

describe('formatPercent', () => {
  it('takes a share and always shows one decimal', () => {
    expect(formatPercent(0.159, 'cs')).toBe(`15,9${NBSP}%`)
    expect(formatPercent(0.1, 'cs')).toBe(`10,0${NBSP}%`)
    expect(formatPercent(0.159, 'en')).toBe('15.9%')
  })
})

describe('formatDate', () => {
  it('formats an ISO date for the locale', () => {
    expect(formatDate('2026-01-01', 'cs')).toBe('1. 1. 2026')
    expect(formatDate('2026-12-31', 'en')).toBe('31 Dec 2026')
  })

  it('does not shift the day by the time zone', () => {
    expect(formatDate('2027-03-31', 'cs')).toBe('31. 3. 2027')
  })

  it('returns anything that is not a real ISO date unchanged', () => {
    expect(formatDate('nonsense', 'cs')).toBe('nonsense')
    expect(formatDate('2026-02-30', 'cs')).toBe('2026-02-30')
  })
})

describe('parseNumberInput', () => {
  it.each([
    ['39 700', 39700],
    [`39${NBSP}700`, 39700],
    ['39 700', 39700],
    ['1 234 567', 1234567],
    ['1,5', 1.5],
    ['1.5', 1.5],
    ['  12 ', 12],
    ['0', 0],
    ['-12,5', -12.5],
    ['+7', 7],
    ['1 234,5', 1234.5],
    ['1.234,5', 1234.5],
    ['1,234.5', 1234.5],
    ['1.234.567', 1234567],
    ['1,234,567', 1234567],
  ])('reads %j as %d', (text, expected) => {
    expect(parseNumberInput(text)).toBe(expected)
  })

  it.each(['', '   ', 'abc', '12 Kč', '1 5', '12.', '.5', '1e5', '1..2', '1,2,3', '1,234,5', '1.5.5', '1.234,5,6', '--5', '12%'])(
    'rejects %j',
    (text) => {
      expect(parseNumberInput(text)).toBeNull()
    },
  )

  it('rejects numbers that are not finite', () => {
    expect(parseNumberInput('9'.repeat(400))).toBeNull()
  })
})
