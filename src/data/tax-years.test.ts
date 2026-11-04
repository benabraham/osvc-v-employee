import { describe, expect, it } from 'vitest'
import { averageWageFor, calculateOsvcMinimums, calculatePausalniDanMonthlyAmounts } from '../calc/osvc-regimes'
import { calculateOsvcPlan } from '../calc/osvc-plan'
import type { FixtureRow } from '../calc/fixtures/run-fixtures'
import netWageRows from '../calc/fixtures/employee-net-wage.json'
import incomeTaxRows from '../calc/fixtures/osvc-income-tax.json'
import { TAX_YEARS, buildYearRates, customYearDataFor, taxYearWindow, unverifiedValuesFor, yearInfoFor } from './tax-years'

const years = Object.values(TAX_YEARS)

// PRD "Value verification" step 3: values that follow from the average wage are recomputed and must match
describe.each(years)('derivation check for $year', (data) => {
  it('average wage = general assessment base × coefficient, rounded up', () => {
    expect(averageWageFor(data)).toBe(data.averageWage)
  })

  it('paušální daň band 1 to 3 follow from the average wage', () => {
    const { monthlyAmounts } = calculatePausalniDanMonthlyAmounts({
      averageWage: data.averageWage,
      rates: { socialMinimumShare: data.socialMinimumShare },
    })
    expect(monthlyAmounts).toEqual(data.pausalniDanMonthly)
  })

  it('reduction thresholds are a thirtieth of the unrounded average wage, × 1.5 and × 3, rounded up (§ 22 zákona 187/2006 Sb.)', () => {
    const first = (data.generalAssessmentBase * data.conversionCoefficient) / 30
    expect(data.reductionThresholds).toEqual([first, first * 1.5, first * 3].map((value) => Math.ceil(value)))
  })

  it('the sickness threshold never falls and follows a tenth of the average wage (§ 6 odst. 2 zákona 187/2006 Sb.)', () => {
    expect(data.sicknessEligibilityThreshold).toBeGreaterThanOrEqual(Math.floor(data.averageWage / 10 / 500) * 500)
  })
})

describe('minimum bases against the published figures', () => {
  it.each([
    [2024, 263_802, 158_292, 131_904, 1_582_812],
    [2025, 279_342, 195_540, 139_680, 1_676_052],
    [2026, 293_802, 205_668, 146_904, 1_762_812],
    [2027, 309_978, 216_996, 154_992, 1_859_868],
  ])('%d: ZP %d, SP %d, new OSVČ SP %d, 23 %% threshold %d', (year, health, social, newSocial, threshold) => {
    const regular = buildYearRates({ data: TAX_YEARS[year]! })
    const newOsvc = buildYearRates({ data: TAX_YEARS[year]!, isNewOsvc: true })
    expect(regular.plan.healthInsurance.minimumAssessmentBase).toBe(health)
    expect(regular.plan.socialInsurance.minimumAssessmentBase).toBe(social)
    expect(newOsvc.plan.socialInsurance.minimumAssessmentBase).toBe(newSocial)
    expect(regular.plan.incomeTax.solidarityThreshold).toBe(threshold)
  })
})

describe('buildYearRates', () => {
  it.each([2024, 2025, 2026])('employee rates for %d equal the rates the payroll fixtures were made with', (year) => {
    // the library still had the student credit in 2024; zákon 349/2023 Sb. abolished it from 2024 until 2027
    const { studentCredit: _, ...fixtureRates } = (netWageRows as FixtureRow[]).find(
      (row) => row.taxYear === year && row.source === 'generated',
    )!.rates as Record<string, unknown>
    expect(buildYearRates({ data: TAX_YEARS[year]! }).employee).toEqual(fixtureRates)
  })

  it.each([2024, 2025])('OSVČ income tax rates for %d equal the fixture rates', (year) => {
    const fixtureRates = (incomeTaxRows as FixtureRow[]).find((row) => row.taxYear === year && row.source === 'generated')!.rates
    expect(buildYearRates({ data: TAX_YEARS[year]! }).plan.incomeTax).toEqual(fixtureRates)
  })

  it('reproduces the PRD 2026 parity fixture through the plan', () => {
    const plan = calculateOsvcPlan({
      workingDays: TAX_YEARS[2026]!.workingDays,
      vacationDays: 20,
      hoursPerDay: 5,
      nonBillableHoursPerYear: 80,
      hourlyRate: 650,
      expenseRate: 0.6,
      costsPerYear: 47_000,
      reserveMonths: 1.5,
      rates: buildYearRates({ data: TAX_YEARS[2026]! }).plan,
    })
    expect([plan.invoiced, plan.totalLevies, plan.netMonthly]).toEqual([695_500, 110_610, 39_700])
  })

  it('gives the student credit only in years that have it', () => {
    expect(buildYearRates({ data: TAX_YEARS[2026]! }).employee.studentCredit).toBeUndefined()
    expect(buildYearRates({ data: TAX_YEARS[2027]! }).employee.studentCredit).toBe(335)
  })

  it('keeps the minimums in step with calculateOsvcMinimums', () => {
    const data = TAX_YEARS[2027]!
    expect(buildYearRates({ data }).minimums).toEqual(
      calculateOsvcMinimums({ averageWage: data.averageWage, rates: { socialMinimumShare: 0.35, newOsvcSocialMinimumShare: 0.25 } }),
    )
  })
})

describe('tax year window', () => {
  const today = new Date('2026-11-04')

  it('covers two past years, the current one and the next', () => {
    expect(taxYearWindow({ today })).toEqual([2024, 2025, 2026, 2027])
    expect(taxYearWindow({ today: new Date('2027-01-02') })).toEqual([2025, 2026, 2027, 2028])
  })

  it('labels each year and says whether it has data', () => {
    expect(yearInfoFor({ year: 2024, today })).toEqual({ year: 2024, kind: 'historical', hasData: true })
    expect(yearInfoFor({ year: 2026, today })).toEqual({ year: 2026, kind: 'current', hasData: true })
    expect(yearInfoFor({ year: 2028, today: new Date('2027-03-01') })).toEqual({ year: 2028, kind: 'next', hasData: false })
  })

  it('prefills custom data from the latest known year', () => {
    const custom = customYearDataFor({ year: 2028 })
    expect(custom.year).toBe(2028)
    expect(custom.averageWage).toBe(TAX_YEARS[2027]!.averageWage)
    expect(unverifiedValuesFor({ data: custom })).toEqual(['averageWage'])
  })

  it('marks the 2027 values the agencies have not published yet', () => {
    expect(unverifiedValuesFor({ data: TAX_YEARS[2027]! })).toContain('pausalniDanMonthly')
    expect(unverifiedValuesFor({ data: TAX_YEARS[2026]! })).toEqual([])
  })
})
