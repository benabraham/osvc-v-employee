import { describe, expect, it } from 'vitest'
import { TAX_YEARS, buildYearRates } from '../data/tax-years'
import { calculateEmployeeNetWage } from './employee-net-wage'

/**
 * PRD "Value verification" step 4: our employee net wage against independent payroll calculators
 * (kurzy.cz, mesec.cz, vypocet.cz; captured 5 November 2026) and a hand calculation from the statutes.
 * Details and URLs: docs/legal-research/payroll-cross-check.md.
 */
const cases = [
  // year, gross, children, SP (incl. 2024 sickness), ZP, tax advance, net, who agrees
  [2024, 35_000, 0, 2_485, 1_575, 2_680, 28_260, 'kurzy.cz'],
  [2024, 40_001, 0, 2_841, 1_801, 3_445, 31_914, 'kurzy.cz (7.1 % rounded once)'],
  [2024, 160_000, 0, 11_360, 7_200, 23_678, 117_762, 'kurzy.cz, above the 23 % threshold'],
  [2025, 35_000, 0, 2_485, 1_575, 2_680, 28_260, 'kurzy.cz'],
  [2025, 80_000, 0, 5_680, 3_600, 9_430, 61_290, 'kurzy.cz'],
  [2025, 160_000, 0, 11_360, 7_200, 23_057, 118_383, 'hand calculation; kurzy.cz rounds the advance down to 23 056'],
  [2026, 35_000, 0, 2_485, 1_575, 2_680, 28_260, 'kurzy.cz, mesec.cz, vypocet.cz'],
  [2026, 80_000, 0, 5_680, 3_600, 9_430, 61_290, 'kurzy.cz, mesec.cz, vypocet.cz'],
  [2026, 160_000, 0, 11_360, 7_200, 22_478, 118_962, 'kurzy.cz, mesec.cz, vypocet.cz'],
  [2026, 80_000, 2, 5_680, 3_600, 6_303, 64_417, 'mesec.cz, vypocet.cz'],
] as const

describe('employee net wage against independent payroll calculators', () => {
  it.each(cases)('%d: gross %d Kč with %d children', (year, grossWage, children, social, health, taxAdvance, net) => {
    const result = calculateEmployeeNetWage({ grossWage, children, rates: buildYearRates({ data: TAX_YEARS[year]! }).employee })
    expect(result.employeeSocialInsurance + result.employeeSicknessInsurance).toBe(social)
    expect(result.employeeHealthInsurance).toBe(health)
    expect(result.netWage).toBe(net)
    if (children === 0) expect(grossWage - social - health - result.netWage).toBe(taxAdvance)
  })
})
