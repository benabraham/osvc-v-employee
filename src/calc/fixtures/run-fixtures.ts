import { describe, expect, it } from 'vitest'

/**
 * One case exported from the reference Python library by reference/harness/generate_fixtures.py.
 * `library-test` rows carry the library's hand-written expectations, `generated` rows its computed output.
 */
export type FixtureRow = {
  source: string
  libraryClass: string
  taxYear: number
  input: Record<string, unknown>
  rates: Record<string, unknown>
  expected: Record<string, number | string>
}

/**
 * Registers one test per fixture row: the calculator gets the row's input plus its rates,
 * and every expected field must match (integers exactly, decimals to 6 places like the library's tests).
 *
 * @param {object} options
 * @param {string} options.name suite name
 * @param {unknown} options.rows fixture rows from a JSON file
 * @param {(input: any) => Record<string, unknown>} options.calculate calculator under test
 */
export const describeFixtures = ({
  name,
  rows,
  calculate,
}: {
  name: string
  rows: unknown
  calculate: (input: any) => Record<string, unknown>
}) => {
  const cases = (rows as FixtureRow[]).map((row, index) => [
    `${row.taxYear} ${row.libraryClass} ${row.source} #${index}`,
    row,
  ] as const)

  describe(name, () => {
    it('has fixtures', () => {
      expect(cases.length).toBeGreaterThan(0)
    })

    it.each(cases)('%s', (_label, row) => {
      const result = calculate({ ...row.input, rates: row.rates })
      Object.entries(row.expected).forEach(([key, expected]) => {
        const actual = result[key]
        const message = `${key} for input ${JSON.stringify(row.input)}`
        if (typeof expected === 'number' && !Number.isInteger(expected)) {
          expect(actual, message).toBeCloseTo(expected, 6)
        } else {
          expect(actual, message).toBe(expected)
        }
      })
    })
  })
}
