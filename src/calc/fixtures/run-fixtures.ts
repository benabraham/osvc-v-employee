import { describe, expect, it } from 'vitest'

/**
 * One case exported once from the reference Python library (kept outside the repository); the JSON is frozen.
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
 * @param {Record<string, string>} [options.lawDifferences] rows (by label) where the library departs from the law,
 *   with the reason; they run as expected failures, so a row that starts to pass is noticed
 */
export const describeFixtures = ({
  name,
  rows,
  calculate,
  lawDifferences = {},
}: {
  name: string
  rows: unknown
  calculate: (input: any) => Record<string, unknown>
  lawDifferences?: Record<string, string>
}) => {
  const cases = (rows as FixtureRow[]).map((row, index) => [
    `${row.taxYear} ${row.libraryClass} ${row.source} #${index}`,
    row,
  ] as const)

  describe(name, () => {
    it('has fixtures', () => {
      expect(cases.length).toBeGreaterThan(0)
    })

    const checkRow = (row: FixtureRow) => {
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
    }

    cases.forEach(([label, row]) => {
      const reason = lawDifferences[label]
      if (reason) it.fails(`${label} (differs from the law: ${reason})`, () => checkRow(row))
      else it(label, () => checkRow(row))
    })
  })
}
