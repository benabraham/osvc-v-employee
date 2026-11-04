import { describe, expect, it } from 'vitest'
import { calculateEmployeeNetWage } from './employee-net-wage'
import type { FixtureRow } from './fixtures/run-fixtures'
import netWageRows from './fixtures/employee-net-wage.json'
import { findGrossWageForNetWage } from './gross-from-net'

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

describe('child credit for a child with a ZTP/P card (§ 35c odst. 7 zákona 586/1992 Sb.)', () => {
  // 2026 monthly credits: first child 1 267 Kč, second 1 860 Kč, third and more 2 320 Kč
  it('doubles the monthly credit of a ZTP/P child: 2 × 1 267 Kč', () => {
    const result = calculateEmployeeNetWage({ grossWage: 50_000, childrenDetail: [{ hasZtpP: true }], rates: rates2026 })
    expect(result.childCredit).toBe(2_534)
  })

  it('uses the position of each child for the monthly amount', () => {
    const result = calculateEmployeeNetWage({
      grossWage: 50_000,
      childrenDetail: [{ hasZtpP: false }, { hasZtpP: true }],
      rates: rates2026,
    })
    // 1 267 + 2 × 1 860
    expect(result.childCredit).toBe(4_987)
  })

  it('lifts the net wage by the extra credit when the child has a ZTP/P card', () => {
    const withoutCard = calculateEmployeeNetWage({ grossWage: 50_000, childrenDetail: [{ hasZtpP: false }], rates: rates2026 })
    const withCard = calculateEmployeeNetWage({ grossWage: 50_000, childrenDetail: [{ hasZtpP: true }], rates: rates2026 })
    // the tax advance covers the credit in full at this wage, so the extra 1 267 Kč is paid out as net pay
    expect(withCard.netWage - withoutCard.netWage).toBe(1_267)
  })

  it('replaces the children count when childrenDetail is given', () => {
    const result = calculateEmployeeNetWage({
      grossWage: 50_000,
      children: 2,
      childrenDetail: [{ hasZtpP: false }],
      rates: rates2026,
    })
    expect(result.childCredit).toBe(1_267)
  })

  it('passes childrenDetail through findGrossWageForNetWage to every candidate wage', () => {
    const result = findGrossWageForNetWage({ targetNetWage: 39_700, childrenDetail: [{ hasZtpP: true }], rates: rates2026 })
    expect(result.childCredit).toBe(2_534)
    expect(result.netWage).toBeGreaterThanOrEqual(39_700)
  })
})
