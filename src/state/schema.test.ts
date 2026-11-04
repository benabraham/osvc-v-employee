import { describe, expect, it } from 'vitest'
import { defaultInputs, DEFAULT_COSTS } from '../model/inputs'
import { TAX_YEARS } from '../data/tax-years'
import { initialState, normalizeInputs, normalizeState, CURRENT_STATE_VERSION } from './schema'

const today = new Date(2026, 10, 4, 10, 0, 0)

describe('normalizeInputs', () => {
  it.each([undefined, null, 'garbage', 42, true, [], [1, 2]])('returns the defaults for non-object input %j', (value) => {
    expect(normalizeInputs(value)).toEqual(defaultInputs())
  })

  it('keeps the defaults for every key the object does not carry', () => {
    expect(normalizeInputs({ hourlyRate: 700 })).toEqual({ ...defaultInputs(), hourlyRate: 700 })
  })

  it('replaces wrong types and non-finite numbers with the default', () => {
    const inputs = normalizeInputs({
      hourlyRate: '700',
      vacationDays: Number.NaN,
      hoursPerDay: Number.POSITIVE_INFINITY,
      usesPausalniDan: 'yes',
      nonBillableHoursPerYear: null,
      reserveMonths: Number.NEGATIVE_INFINITY,
    })
    expect(inputs.hourlyRate).toBe(defaultInputs().hourlyRate)
    expect(inputs.vacationDays).toBe(defaultInputs().vacationDays)
    expect(inputs.hoursPerDay).toBe(defaultInputs().hoursPerDay)
    expect(inputs.usesPausalniDan).toBe(false)
    expect(inputs.nonBillableHoursPerYear).toBe(defaultInputs().nonBillableHoursPerYear)
    expect(inputs.reserveMonths).toBe(defaultInputs().reserveMonths)
  })

  it('keeps finite negative and fractional numbers as typed, since the form never blocks input', () => {
    expect(normalizeInputs({ hourlyRate: -5, reserveMonths: 0.25 })).toMatchObject({ hourlyRate: -5, reserveMonths: 0.25 })
  })

  it.each([0.3, 0.4, 0.6, 0.8])('keeps expense rate %s', (expenseRate) => {
    expect(normalizeInputs({ expenseRate }).expenseRate).toBe(expenseRate)
  })

  it('replaces an expense rate outside the four allowed values', () => {
    expect(normalizeInputs({ expenseRate: 0.5 }).expenseRate).toBe(defaultInputs().expenseRate)
    expect(normalizeInputs({ expenseRate: '0.8' }).expenseRate).toBe(defaultInputs().expenseRate)
  })

  it('accepts the three disability degrees and replaces anything else', () => {
    expect(normalizeInputs({ credits: { disability: 'degree3' } }).credits.disability).toBe('degree3')
    expect(normalizeInputs({ credits: { disability: 'degree9' } }).credits.disability).toBe('none')
  })

  it('drops unknown keys at every level', () => {
    const inputs = normalizeInputs({ unknownKey: 1, credits: { spouse: true, bogus: 2 }, deductions: { nope: 3 } })
    expect(inputs).not.toHaveProperty('unknownKey')
    expect(inputs.credits).not.toHaveProperty('bogus')
    expect(inputs.credits.spouse).toBe(true)
    expect(inputs.deductions).toEqual(defaultInputs().deductions)
  })

  it('fills nested objects that are missing or not objects with their defaults', () => {
    expect(normalizeInputs({ credits: 'nope', sicknessInsurance: [1] })).toMatchObject({
      credits: defaultInputs().credits,
      sicknessInsurance: defaultInputs().sicknessInsurance,
    })
  })

  it('keeps a numeric sickness base and replaces a non-numeric one with null', () => {
    expect(normalizeInputs({ sicknessInsurance: { enabled: true, monthlyAssessmentBase: 9_000 } }).sicknessInsurance).toEqual({
      enabled: true,
      monthlyAssessmentBase: 9_000,
    })
    expect(normalizeInputs({ sicknessInsurance: { enabled: true, monthlyAssessmentBase: '9000' } }).sicknessInsurance.monthlyAssessmentBase).toBeNull()
  })

  it('keeps workingDays as null unless the user typed a finite number', () => {
    expect(normalizeInputs({}).workingDays).toBeNull()
    expect(normalizeInputs({ workingDays: 'x' }).workingDays).toBeNull()
    expect(normalizeInputs({ workingDays: 248 }).workingDays).toBe(248)
  })

  it('validates children item by item, drops non-objects and fills missing fields', () => {
    const inputs = normalizeInputs({
      children: [{ months: 6, hasZtpP: true, preschoolFees: 1_000 }, 'garbage', { months: 'x' }, null],
    })
    expect(inputs.children).toEqual([
      { months: 6, hasZtpP: true, preschoolFees: 1_000 },
      { months: 12, hasZtpP: false, preschoolFees: 0 },
    ])
  })

  it('replaces a children value that is not an array with an empty list', () => {
    expect(normalizeInputs({ children: { months: 12 } }).children).toEqual([])
  })

  it('keeps costs as given and validates them item by item', () => {
    const inputs = normalizeInputs({ costs: [{ id: 'laptop', name: 'notebook', price: 30_000, months: 36 }, { price: 'x', name: 7 }, 'bad'] })
    expect(inputs.costs).toHaveLength(2)
    expect(inputs.costs[0]).toEqual({ id: 'laptop', name: 'notebook', price: 30_000, months: 36 })
    expect(inputs.costs[1]).toMatchObject({ name: '', price: 0, months: 12 })
    expect(inputs.costs[1]!.id).toEqual(expect.any(String))
    expect(inputs.costs[1]!.id).not.toBe('')
  })

  it('gives a cost without an id a new one and makes duplicate ids unique', () => {
    const inputs = normalizeInputs({
      costs: [
        { id: 'same', name: 'a', price: 1, months: 1 },
        { id: 'same', name: 'b', price: 2, months: 1 },
        { name: 'c', price: 3, months: 1 },
      ],
    })
    const ids = inputs.costs.map((cost) => cost.id)
    expect(new Set(ids).size).toBe(3)
    expect(ids[0]).toBe('same')
    expect(ids[1]).not.toBe('same')
  })

  it('uses the default costs when costs are missing', () => {
    expect(normalizeInputs({}).costs).toEqual(DEFAULT_COSTS)
  })

  it('keeps overrides when they are numbers and resets other values to null', () => {
    expect(normalizeInputs({ overrides: { taxDeductibleCosts: 12_000, totalLevies: 'x' } }).overrides).toEqual({
      taxDeductibleCosts: 12_000,
      totalLevies: null,
    })
  })

  it('returns the defaults when given the defaults', () => {
    expect(normalizeInputs(defaultInputs())).toEqual(defaultInputs())
  })
})

describe('initialState', () => {
  it('starts in the current year, Czech, with default inputs and nothing stored', () => {
    expect(initialState({ today })).toEqual({
      version: CURRENT_STATE_VERSION,
      locale: 'cs',
      activeYear: 2026,
      syncInputs: false,
      sharedInputs: defaultInputs(),
      inputsByYear: {},
      customYearData: {},
      useCustomData: {},
      officialDataPromptAnswered: {},
      scenarios: [],
      hasCompletedSetup: false,
      theme: 'system',
    })
  })
})

describe('normalizeState', () => {
  it('moves a stored year that has left the window to the current year (PRD "Tax years")', () => {
    const stored = { ...initialState({ today: new Date('2026-11-04') }), activeYear: 2024 }
    expect(normalizeState(stored, { today: new Date('2027-01-02') }).activeYear).toBe(2027)
    expect(normalizeState({ ...stored, activeYear: 2025 }, { today: new Date('2027-01-02') }).activeYear).toBe(2025)
  })

  it.each([undefined, null, 'garbage', [], 7])('returns the initial state for %j', (value) => {
    expect(normalizeState(value, { today })).toEqual(initialState({ today }))
  })

  it('returns the initial state for an unknown version', () => {
    expect(normalizeState({ version: 2, locale: 'en' }, { today })).toEqual(initialState({ today }))
    expect(normalizeState({ locale: 'en' }, { today })).toEqual(initialState({ today }))
    expect(normalizeState({ version: '1', locale: 'en' }, { today })).toEqual(initialState({ today }))
  })

  it('round-trips a valid state through JSON unchanged', () => {
    const state = {
      ...initialState({ today }),
      locale: 'en' as const,
      activeYear: 2025,
      syncInputs: true,
      sharedInputs: { ...defaultInputs(), hourlyRate: 700 },
      inputsByYear: { '2025': { ...defaultInputs(), hourlyRate: 500 } },
      useCustomData: { '2028': true },
      officialDataPromptAnswered: { '2027': true },
      scenarios: [{ id: 'a', name: 'Plan', year: 2025, inputs: defaultInputs(), createdAt: '2026-01-02T03:04:05.000Z' }],
      hasCompletedSetup: true,
      theme: 'dark' as const,
    }
    expect(normalizeState(JSON.parse(JSON.stringify(state)), { today })).toEqual(state)
  })

  it('replaces an invalid activeYear with the current year and an invalid locale with cs', () => {
    const state = normalizeState({ version: 1, activeYear: 1999, locale: 'de', theme: 'pink' }, { today })
    expect(state.activeYear).toBe(2026)
    expect(state.locale).toBe('cs')
    expect(state.theme).toBe('system')
  })

  it('keeps only canonical year keys in the per-year records', () => {
    const state = normalizeState(
      {
        version: 1,
        inputsByYear: { '2025': { hourlyRate: 500 }, abc: { hourlyRate: 1 }, '1999': {}, '2101': {}, '2025.0': {} },
        useCustomData: { '2028': true, '2029': 'yes' },
      },
      { today },
    )
    expect(Object.keys(state.inputsByYear)).toEqual(['2025'])
    expect(state.inputsByYear['2025']!.hourlyRate).toBe(500)
    expect(state.useCustomData).toEqual({ '2028': true, '2029': false })
  })

  it('drops scenarios without a usable id or year and fills the rest', () => {
    const state = normalizeState(
      {
        version: 1,
        scenarios: [
          { id: 'ok', year: 2026, inputs: { hourlyRate: 800 } },
          { name: 'no id', year: 2026 },
          { id: 'no-year', year: 'x' },
          'garbage',
        ],
      },
      { today },
    )
    expect(state.scenarios).toHaveLength(1)
    expect(state.scenarios[0]).toMatchObject({ id: 'ok', name: '', year: 2026, createdAt: today.toISOString() })
    expect(state.scenarios[0]!.inputs.hourlyRate).toBe(800)
  })

  it('normalizes custom year data against the latest official year, keeping valid numbers', () => {
    const latest = TAX_YEARS[2027]!
    const state = normalizeState(
      {
        version: 1,
        customYearData: {
          '2028': { ...latest, year: 2025, averageWage: 60_000, minimumWage: 'x', pausalniDanMonthly: [1, 'x', 3], status: { averageWage: 'custom', minimumWage: 'bogus' } },
        },
      },
      { today },
    )
    const custom = state.customYearData['2028']!
    expect(custom.year).toBe(2028)
    expect(custom.averageWage).toBe(60_000)
    expect(custom.minimumWage).toBe(latest.minimumWage)
    expect(custom.pausalniDanMonthly).toEqual([1, latest.pausalniDanMonthly[1], 3])
    expect(custom.status).toEqual({ averageWage: 'custom' })
    expect(custom.incomeTax.payerCredit).toBe(latest.incomeTax.payerCredit)
    expect(custom.incomeTax.childCreditsMonthly).toEqual(latest.incomeTax.childCreditsMonthly)
  })

  it('replaces custom year data that is not an object with a complete data set', () => {
    const state = normalizeState({ version: 1, customYearData: { '2028': 'garbage' } }, { today })
    expect(state.customYearData['2028']).toMatchObject({ year: 2028, workingDays: TAX_YEARS[2027]!.workingDays })
    expect(Object.values(state.customYearData['2028']!.reductionThresholds)).toHaveLength(3)
  })

  it('keeps sources that have the expected shape and drops the rest', () => {
    const state = normalizeState(
      {
        version: 1,
        customYearData: {
          '2028': { ...TAX_YEARS[2027], sources: { averageWage: [{ label: 'x', url: 'https://example.test' }], minimumWage: 'nope' } },
        },
      },
      { today },
    )
    expect(state.customYearData['2028']!.sources).toEqual({ averageWage: [{ label: 'x', url: 'https://example.test' }] })
  })
})
