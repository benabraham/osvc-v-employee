import { describe, expect, it } from 'vitest'
import { DEFAULT_COSTS } from './inputs'
import { costsPerYearFor, yearlyCostFor } from './costs'

describe('yearlyCostFor (amortisation of the costs list)', () => {
  it('spreads a purchase over its months: 60 000 Kč over 36 months is 20 000 Kč a year', () => {
    expect(yearlyCostFor({ cost: { id: 'hardware', name: 'hardware', price: 60_000, months: 36 } })).toBe(20_000)
  })

  it('keeps a yearly cost as its price', () => {
    expect(yearlyCostFor({ cost: { id: 'accountant', name: 'účetní', price: 5_000, months: 12 } })).toBe(5_000)
  })

  it('counts a one-month purchase as twelve times its price', () => {
    expect(yearlyCostFor({ cost: { id: 'software', name: 'software', price: 1_000, months: 1 } })).toBe(12_000)
  })

  it('counts nothing when the months are zero or negative', () => {
    expect(yearlyCostFor({ cost: { id: 'x', name: 'x', price: 1_000, months: 0 } })).toBe(0)
    expect(yearlyCostFor({ cost: { id: 'x', name: 'x', price: 1_000, months: -3 } })).toBe(0)
  })
})

describe('costsPerYearFor', () => {
  it('sums the sheet default list to 47 000 Kč a year', () => {
    expect(costsPerYearFor({ costs: DEFAULT_COSTS })).toBe(47_000)
  })

  it('rounds the total to whole crowns, ties away from zero', () => {
    // 1 Kč over 24 months is 0.5 Kč a year, which rounds up to 1 Kč
    expect(costsPerYearFor({ costs: [{ id: 'x', name: 'x', price: 1, months: 24 }] })).toBe(1)
  })

  it('is zero for an empty list', () => {
    expect(costsPerYearFor({ costs: [] })).toBe(0)
  })
})
