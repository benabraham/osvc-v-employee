import { describe, expect, it } from 'vitest'
import { floorDivide, roundHalfAwayFromZero } from './rounding'

describe('roundHalfAwayFromZero', () => {
  it.each([
    [2182.5, 0, 2183],
    [2182.49, 0, 2182],
    [-2.5, 0, -3],
    [0.125, 2, 0.13],
    [2.675, 2, 2.67], // the float is 2.67499999…, so it is not a tie
    [1.005, 2, 1],
    [1469.7, 2, 1469.7],
    [163.04040000000001, 4, 163.0404],
    [24194.400000000001, 8, 24194.4],
    [0, 2, 0],
  ])('rounds %d to %d digits as %d', (value, digits, expected) => {
    expect(roundHalfAwayFromZero(value, digits)).toBe(expected)
  })

  it('defaults to whole numbers', () => {
    expect(roundHalfAwayFromZero(4075.5)).toBe(4076)
  })
})

describe('floorDivide', () => {
  it.each([
    [220_000_000_000_000, 1_000_000, 220_000_000],
    [7, 2, 3],
    [-7, 2, -4],
  ])('floor-divides %d by %d', (dividend, divisor, expected) => {
    expect(floorDivide(dividend, divisor)).toBe(expected)
  })

  it('stays exact where plain division would round up across an integer', () => {
    const dividend = 10 ** 9 * 109_968 * 0.5
    expect(floorDivide(dividend, 10 ** 6)).toBe(Math.floor(dividend / 10 ** 6))
  })
})

describe('roundHalfAwayFromZero with negative digits (Sheets ROUND)', () => {
  it.each([
    [1907.4, -1, 1910],
    [1905, -1, 1910],
    [476_770, -3, 477_000],
    [39_730.83, -2, 39_700],
    [549.2, -2, 500],
    [-150, -2, -200],
  ])('rounds %d to %d digits as %d', (value, digits, expected) => {
    expect(roundHalfAwayFromZero(value, digits)).toBe(expected)
  })
})
