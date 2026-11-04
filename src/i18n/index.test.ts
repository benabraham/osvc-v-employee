import { describe, expect, it } from 'vitest'
import { createTranslator, mergeBundles } from './index'
import type { MessageBundle } from './types'

const featureBundle: MessageBundle = {
  cs: { 'feature.greeting': 'Ahoj, {name}', 'feature.onlyCzech': 'Jen česky' },
  en: { 'feature.greeting': 'Hello, {name}' },
}

const otherBundle: MessageBundle = {
  cs: { 'other.count': 'Položek: {count} z {total}' },
  en: { 'other.count': 'Items: {count} of {total}' },
}

describe('createTranslator', () => {
  it('returns the message for the locale', () => {
    const t = createTranslator({ locale: 'en', bundles: [featureBundle] })
    expect(t('feature.greeting', { name: 'Dan' })).toBe('Hello, Dan')
  })

  it('reads messages from every bundle', () => {
    const t = createTranslator({ locale: 'cs', bundles: [featureBundle, otherBundle] })
    expect(t('feature.greeting', { name: 'Dan' })).toBe('Ahoj, Dan')
    expect(t('other.count', { count: 2, total: 5 })).toBe('Položek: 2 z 5')
  })

  it('falls back to Czech when the English message is missing', () => {
    const t = createTranslator({ locale: 'en', bundles: [featureBundle] })
    expect(t('feature.onlyCzech')).toBe('Jen česky')
  })

  it('falls back to the key when no locale has the message', () => {
    const t = createTranslator({ locale: 'en', bundles: [featureBundle] })
    expect(t('missing.key')).toBe('missing.key')
  })

  it('does not return Object.prototype members for keys that look like them', () => {
    const t = createTranslator({ locale: 'cs', bundles: [featureBundle] })
    expect(t('constructor')).toBe('constructor')
    expect(t('toString')).toBe('toString')
  })

  it('replaces every {name} placeholder and leaves unknown ones visible', () => {
    const t = createTranslator({ locale: 'cs', bundles: [otherBundle] })
    expect(t('other.count', { count: 0 })).toBe('Položek: 0 z {total}')
    expect(t('other.count', { count: 1, total: 1 })).toBe('Položek: 1 z 1')
  })

  it('returns the template when there are no params', () => {
    const t = createTranslator({ locale: 'cs', bundles: [otherBundle] })
    expect(t('other.count')).toBe('Položek: {count} z {total}')
  })

  it('works with no bundles, returning keys', () => {
    const t = createTranslator({ locale: 'cs', bundles: [] })
    expect(t('any.key')).toBe('any.key')
  })
})

describe('mergeBundles', () => {
  it('combines the messages of both locales', () => {
    const merged = mergeBundles(featureBundle, otherBundle)
    expect(Object.keys(merged.cs).sort()).toEqual(['feature.greeting', 'feature.onlyCzech', 'other.count'])
    expect(Object.keys(merged.en).sort()).toEqual(['feature.greeting', 'other.count'])
  })

  it('returns empty dictionaries for no bundles', () => {
    expect(mergeBundles()).toEqual({ cs: {}, en: {} })
  })

  it('throws in development when two bundles define the same key', () => {
    const duplicate: MessageBundle = {
      cs: { 'feature.greeting': 'Čau' },
      en: { 'feature.greeting': 'Hi' },
    }
    expect(() => mergeBundles(featureBundle, duplicate)).toThrow(/feature\.greeting/)
  })
})
