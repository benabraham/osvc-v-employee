import { describe, expect, it } from 'vitest'
import { allBundles } from './index'

// Every feature bundle registered in allBundles must be complete in both languages
describe.each(allBundles.map((bundle, index) => ({ index, bundle })))('message bundle $index', ({ bundle }) => {
  it('has the same keys in Czech and English', () => {
    expect(Object.keys(bundle.en).sort()).toEqual(Object.keys(bundle.cs).sort())
  })

  it('has the same {placeholders} in Czech and English for every key', () => {
    const placeholdersOf = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort().join(' ')
    const mismatches = Object.keys(bundle.cs).filter((key) => placeholdersOf(bundle.cs[key] ?? '') !== placeholdersOf(bundle.en[key] ?? ''))
    expect(mismatches).toEqual([])
  })

  it('has no empty or padded messages', () => {
    const invalidKeys = [...Object.entries(bundle.cs), ...Object.entries(bundle.en)]
      .filter(([, text]) => text.trim() === '' || text !== text.trim())
      .map(([key]) => key)
    expect(invalidKeys).toEqual([])
  })

  it('uses dotted keys', () => {
    const keys = [...Object.keys(bundle.cs), ...Object.keys(bundle.en)]
    expect(keys.filter((key) => !/^[a-zA-Z]+(\.[a-zA-Z0-9]+)+$/.test(key))).toEqual([])
  })
})

describe('allBundles', () => {
  it('is not empty', () => {
    expect(allBundles.length).toBeGreaterThan(0)
  })
})
