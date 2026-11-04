import { describe, expect, it } from 'vitest'
import { calculateEmployeeNetWage } from './employee-net-wage'
import type { FixtureRow } from './fixtures/run-fixtures'
import netWageRows from './fixtures/employee-net-wage.json'

const rates2026 = (netWageRows as FixtureRow[]).find((row) => row.taxYear === 2026)!.rates as any

describe('minimum health insurance base (zákon 592/1992 Sb. § 3 odst. 4, 6 a 10)', () => {
  it('makes an employee below the minimum wage top up 13.5 % of the difference', () => {
    // 2026 minimum wage 22 400 Kč: 4.5 % of 20 000 = 900, plus 13.5 % of 2 400 = 324
    const result = calculateEmployeeNetWage({ grossWage: 20_000, rates: rates2026 })
    expect(result.employerHealthInsurance).toBe(1_800)
    expect(result.employeeHealthInsurance).toBe(1_224)
  })

  it('does not apply to people the state also insures (students, parents on leave…)', () => {
    const result = calculateEmployeeNetWage({ grossWage: 20_000, isExemptFromMinimumHealthBase: true, rates: rates2026 })
    expect(result.employeeHealthInsurance).toBe(900)
  })

  it('does not change anything at or above the minimum wage', () => {
    expect(calculateEmployeeNetWage({ grossWage: 22_400, rates: rates2026 }).employeeHealthInsurance).toBe(1_008)
  })
})
