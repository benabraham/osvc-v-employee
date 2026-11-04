import { describe, expect, it } from 'vitest'
import { decodeEntities, findPhrase, fragmentText } from './esbirka'

describe('fragmentText', () => {
  it('strips tags, decodes entities and collapses whitespace', () => {
    expect(fragmentText({ xhtml: '<p>(5) Měsíční&nbsp;základ <b>činí</b>\n nejméně 35&#160;% &amp; víc</p>' })).toBe(
      '(5) Měsíční základ činí nejméně 35 % & víc',
    )
  })

  it('falls back to plain text and to an empty string', () => {
    expect(fragmentText({ text: 'Rozhodný příjem činí 2 000 Kč.' })).toBe('Rozhodný příjem činí 2 000 Kč.')
    expect(fragmentText({})).toBe('')
  })
})

describe('decodeEntities', () => {
  it('decodes hexadecimal entities and keeps unknown ones', () => {
    expect(decodeEntities('&#x201E;přirážka&#x201C; &foo;')).toBe('„přirážka“ &foo;')
  })
})

describe('findPhrase', () => {
  it('returns each match with context, across line breaks, treating the phrase literally', () => {
    const text = 'a) 15 % pro část\nzákladu daně do 36násobku průměrné mzdy (1) a 15 % pro část základu'
    expect(findPhrase({ text, phrase: '15 % pro část základu', context: 3 })).toEqual([
      'a) 15 % pro část základu da',
      'a 15 % pro část základu',
    ])
    expect(findPhrase({ text, phrase: '(1)', context: 0 })).toEqual(['(1)'])
  })
})
