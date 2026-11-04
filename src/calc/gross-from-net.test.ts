import { describe, expect, it } from 'vitest'
import { calculateEmployeeNetWage } from './employee-net-wage'
import type { FixtureRow } from './fixtures/run-fixtures'
import netWageRows from './fixtures/employee-net-wage.json'
import { findGrossWageForNetWage } from './gross-from-net'

const ratesFor = (taxYear: number) =>
  (netWageRows as FixtureRow[]).find((row) => row.taxYear === taxYear && row.source === 'generated')!.rates as any

describe('findGrossWageForNetWage', () => {
  const cases = [2024, 2025, 2026].flatMap((taxYear) =>
    [15_000, 25_000, 39_700, 44_100, 100_000].flatMap((targetNetWage) =>
      [0, 2].map((children) => ({ taxYear, targetNetWage, children })),
    ),
  )

  it.each(cases)('$taxYear: net $targetNetWage with $children children', ({ taxYear, targetNetWage, children }) => {
    const rates = ratesFor(taxYear)
    const netFor = (grossWage: number) => calculateEmployeeNetWage({ grossWage, children, rates }).netWage
    const result = findGrossWageForNetWage({ targetNetWage, children, rates })

    expect(result.netWage).toBe(netFor(result.grossWage))
    expect(result.netWage).toBeGreaterThanOrEqual(targetNetWage)
    // it is the smallest such gross: no lower gross reaches the target (checked over a wide window)
    const lowerReachingTarget = Array.from({ length: 3_000 }, (_, offset) => result.grossWage - 1 - offset)
      .filter((grossWage) => grossWage >= 0)
      .find((grossWage) => netFor(grossWage) >= targetNetWage)
    expect(lowerReachingTarget).toBeUndefined()
  })

  it('reports whether the net wage hits the target exactly', () => {
    const rates = ratesFor(2026)
    const exact = findGrossWageForNetWage({ targetNetWage: calculateEmployeeNetWage({ grossWage: 50_000, rates }).netWage, rates })
    expect(exact.isExact).toBe(true)
    expect(exact.grossWage).toBeLessThanOrEqual(50_000)
  })

  it('matches the PRD gross equivalent for 2026 (net 39 700 Kč, payer credit only)', () => {
    expect(findGrossWageForNetWage({ targetNetWage: 39_700, rates: ratesFor(2026) }).grossWage).toBe(50_589)
  })

  it('returns the full payroll breakdown for the gross it finds', () => {
    const result = findGrossWageForNetWage({ targetNetWage: 39_700, rates: ratesFor(2026) })
    expect(result).toMatchObject({ employeeSocialInsurance: expect.any(Number), employeeHealthInsurance: expect.any(Number) })
  })
})
