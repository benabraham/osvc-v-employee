/**
 * The persisted app state (version 1) and the normalizers that turn anything stored, shared or imported
 * into a valid state. Normalizers never throw: whatever is wrong is replaced with the default for that field.
 */
import { customYearDataFor, type Source, type TaxYearData, type ValueStatus } from '../data/tax-years'
import { defaultInputs, type ChildInput, type CostItem, type DisabilityDegree, type Inputs } from '../model/inputs'
import type { ExpenseRate } from '../calc/osvc-regimes'
import { createId } from './id'

/** Version of the persisted state written by this build. Bump it together with a migration in `migrations`. */
export const CURRENT_STATE_VERSION = 1 as const

/** Marker written into exported JSON files, so an import can tell an export of this app from any other JSON. */
export const EXPORT_APP_MARKER = 'osvc-v-employee'

export const LOCALES = ['cs', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const THEMES = ['system', 'light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

/** A named snapshot of one year's inputs, kept on the device. */
export type Scenario = {
  id: string
  name: string
  year: number
  inputs: Inputs
  /** ISO 8601 timestamp */
  createdAt: string
}

/** Everything the app keeps on the device, in one versioned object. */
export type PersistedState = {
  version: typeof CURRENT_STATE_VERSION
  locale: Locale
  activeYear: number
  /** true: every year shares `sharedInputs`; false: each year has its own entry in `inputsByYear` */
  syncInputs: boolean
  sharedInputs: Inputs
  /** keyed by the year as a string, e.g. "2026" */
  inputsByYear: Record<string, Inputs>
  /** the user's own numbers for a year, keyed by the year as a string */
  customYearData: Record<string, TaxYearData>
  /** true: the year uses `customYearData` instead of the official values */
  useCustomData: Record<string, boolean>
  /** true once the user has answered the "switch to the official values?" question for that year */
  officialDataPromptAnswered: Record<string, boolean>
  scenarios: Scenario[]
  hasCompletedSetup: boolean
  theme: Theme
}

const EXPENSE_RATES: readonly ExpenseRate[] = [0.3, 0.4, 0.6, 0.8]
const DISABILITY_DEGREES: readonly DisabilityDegree[] = ['none', 'degree1or2', 'degree3']
const VALUE_STATUSES: readonly ValueStatus[] = ['researched', 'verified', 'custom']

/**
 * Whether a value is a plain object (not null, not an array).
 *
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** The value as a plain object, or an empty object when it is not one. */
const recordOrEmpty = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {})

/** The items of an array that are plain objects; anything else in the array is dropped. */
const recordsOf = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.filter(isRecord) : [])

const finiteOr = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

/** A finite number, or null when the value is null; any other value gives the fallback. */
const nullableFiniteOr = (value: unknown, fallback: number | null): number | null =>
  value === null ? null : typeof value === 'number' && Number.isFinite(value) ? value : fallback

const booleanOr = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const stringOr = (value: unknown, fallback: string): string => (typeof value === 'string' ? value : fallback)

const oneOf = <T>(value: unknown, options: readonly T[], fallback: T): T =>
  options.some((option) => option === value) ? (value as T) : fallback

/**
 * Whether a value is a tax year the app accepts: an integer from 2000 to 2100.
 *
 * @param {unknown} value
 * @returns {value is number}
 */
export const isValidYear = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 2000 && value <= 2100

const yearOr = (value: unknown, fallback: number): number => (isValidYear(value) ? value : fallback)

const normalizeChild = (item: Record<string, unknown>): ChildInput => ({
  months: finiteOr(item.months, 12),
  hasZtpP: booleanOr(item.hasZtpP, false),
  preschoolFees: finiteOr(item.preschoolFees, 0),
})

/** Keeps the ids that are present, non-empty and unique; gives a new id to the rest. */
const normalizeCosts = (items: unknown[]): CostItem[] => {
  const usedIds = new Set<string>()
  return items.filter(isRecord).map((item) => {
    const givenId = typeof item.id === 'string' && item.id !== '' && !usedIds.has(item.id) ? item.id : undefined
    const id = givenId ?? createId()
    usedIds.add(id)
    return {
      id,
      name: stringOr(item.name, ''),
      price: finiteOr(item.price, 0),
      months: finiteOr(item.months, 12),
    }
  })
}

/**
 * Deep-merges an unknown value onto the defaults for one year's inputs: known keys with the right type are
 * kept, anything else gets the default. Arrays (children, costs) are validated item by item.
 *
 * @param {unknown} value whatever was stored, shared or imported
 * @returns {Inputs} always a complete, valid set of inputs
 */
export const normalizeInputs = (value: unknown): Inputs => {
  const defaults = defaultInputs()
  const source = recordOrEmpty(value)
  const credits = recordOrEmpty(source.credits)
  const deductions = recordOrEmpty(source.deductions)
  const sicknessInsurance = recordOrEmpty(source.sicknessInsurance)
  const overrides = recordOrEmpty(source.overrides)
  return {
    workingDays: nullableFiniteOr(source.workingDays, defaults.workingDays),
    vacationDays: finiteOr(source.vacationDays, defaults.vacationDays),
    hoursPerDay: finiteOr(source.hoursPerDay, defaults.hoursPerDay),
    nonBillableHoursPerYear: finiteOr(source.nonBillableHoursPerYear, defaults.nonBillableHoursPerYear),
    hourlyRate: finiteOr(source.hourlyRate, defaults.hourlyRate),
    usesPausalniDan: booleanOr(source.usesPausalniDan, defaults.usesPausalniDan),
    withSalesRegistrationSurcharge: booleanOr(source.withSalesRegistrationSurcharge, defaults.withSalesRegistrationSurcharge),
    expenseRate: oneOf(source.expenseRate, EXPENSE_RATES, defaults.expenseRate),
    isNewOsvc: booleanOr(source.isNewOsvc, defaults.isNewOsvc),
    children: recordsOf(source.children).map(normalizeChild),
    credits: {
      spouse: booleanOr(credits.spouse, defaults.credits.spouse),
      spouseHasZtpP: booleanOr(credits.spouseHasZtpP, defaults.credits.spouseHasZtpP),
      disability: oneOf(credits.disability, DISABILITY_DEGREES, defaults.credits.disability),
      ztpHolder: booleanOr(credits.ztpHolder, defaults.credits.ztpHolder),
      studentMonths: finiteOr(credits.studentMonths, defaults.credits.studentMonths),
      isFirstYearWithRegisteredSales: booleanOr(
        credits.isFirstYearWithRegisteredSales,
        defaults.credits.isFirstYearWithRegisteredSales,
      ),
    },
    deductions: {
      donations: finiteOr(deductions.donations, defaults.deductions.donations),
      bloodDonations: finiteOr(deductions.bloodDonations, defaults.deductions.bloodDonations),
      organDonations: finiteOr(deductions.organDonations, defaults.deductions.organDonations),
      mortgageInterest: finiteOr(deductions.mortgageInterest, defaults.deductions.mortgageInterest),
      mortgageInterestPre2021: finiteOr(deductions.mortgageInterestPre2021, defaults.deductions.mortgageInterestPre2021),
      mortgageMonths: finiteOr(deductions.mortgageMonths, defaults.deductions.mortgageMonths),
      retirementProducts: finiteOr(deductions.retirementProducts, defaults.deductions.retirementProducts),
    },
    sicknessInsurance: {
      enabled: booleanOr(sicknessInsurance.enabled, defaults.sicknessInsurance.enabled),
      monthlyAssessmentBase: nullableFiniteOr(
        sicknessInsurance.monthlyAssessmentBase,
        defaults.sicknessInsurance.monthlyAssessmentBase,
      ),
    },
    reserveMonths: finiteOr(source.reserveMonths, defaults.reserveMonths),
    costs: Array.isArray(source.costs) ? normalizeCosts(source.costs) : defaults.costs,
    invoiceAmount: finiteOr(source.invoiceAmount, defaults.invoiceAmount),
    overrides: {
      taxDeductibleCosts: nullableFiniteOr(overrides.taxDeductibleCosts, null),
      totalLevies: nullableFiniteOr(overrides.totalLevies, null),
    },
  }
}

/**
 * Walks a template of the year-data shape and takes each value from the input when its type matches the
 * template's, otherwise the template's value. Arrays must keep the template's length (paušální bands, thresholds).
 *
 * @param {unknown} value
 * @param {unknown} template
 * @returns {unknown}
 */
const mergeOntoTemplate = (value: unknown, template: unknown): unknown => {
  if (typeof template === 'number') return finiteOr(value, template)
  if (typeof template === 'string') return stringOr(value, template)
  if (typeof template === 'boolean') return booleanOr(value, template)
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length !== template.length) return template
    return template.map((item, index) => mergeOntoTemplate(value[index], item))
  }
  if (isRecord(template)) {
    const source = recordOrEmpty(value)
    return Object.fromEntries(Object.entries(template).map(([key, item]) => [key, mergeOntoTemplate(source[key], item)]))
  }
  return template
}

const isValueStatus = (value: unknown): value is ValueStatus => VALUE_STATUSES.some((status) => status === value)

const isSourceList = (value: unknown): value is Source[] =>
  Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.label === 'string' && typeof item.url === 'string')

/** The entries of a record whose values pass the guard; the rest are dropped. */
const entriesWhere = <T>(value: unknown, isValid: (entry: unknown) => entry is T): Record<string, T> =>
  isRecord(value)
    ? (Object.fromEntries(Object.entries(value).filter(([, entry]) => isValid(entry))) as Record<string, T>)
    : {}

/**
 * The user's own year data, built on the latest official year: numbers and text that match the template's
 * type are kept, the year is the key's year, and status and sources are kept where they have the right shape.
 *
 * @param {unknown} value
 * @param {object} params
 * @param {number} params.year the year the data belongs to (its key in `customYearData`)
 * @returns {TaxYearData}
 */
export const normalizeCustomYearData = (value: unknown, { year }: { year: number }): TaxYearData => {
  const template = customYearDataFor({ year })
  const source = recordOrEmpty(value)
  const merged = mergeOntoTemplate(value, template) as TaxYearData
  return {
    ...merged,
    year,
    status: { ...template.status, ...entriesWhere(source.status, isValueStatus) },
    sources: { ...template.sources, ...entriesWhere(source.sources, isSourceList) },
  }
}

/**
 * A record keyed by year: only canonical year keys ("2026", not "2026.0" or " 2026") are kept.
 *
 * @param {unknown} value
 * @param {(entry: unknown, year: number) => T} normalizeEntry
 * @returns {Record<string, T>}
 */
const normalizeYearRecord = <T>(value: unknown, normalizeEntry: (entry: unknown, year: number) => T): Record<string, T> => {
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => isValidYear(Number(key)) && String(Number(key)) === key)
      .map(([key, entry]) => [key, normalizeEntry(entry, Number(key))]),
  )
}

/** Scenarios without a usable id or year are dropped; a missing name or timestamp gets a default. */
const normalizeScenarios = (value: unknown, { today }: { today: Date }): Scenario[] =>
  recordsOf(value).flatMap((item) => {
    if (typeof item.id !== 'string' || item.id === '' || !isValidYear(item.year)) return []
    return [
      {
        id: item.id,
        name: stringOr(item.name, ''),
        year: item.year,
        inputs: normalizeInputs(item.inputs),
        createdAt: stringOr(item.createdAt, today.toISOString()),
      },
    ]
  })

/**
 * The state for a first visit: the current year, Czech, default inputs, nothing stored yet.
 *
 * @param {object} params
 * @param {Date} params.today
 * @returns {PersistedState}
 */
export const initialState = ({ today }: { today: Date }): PersistedState => ({
  version: CURRENT_STATE_VERSION,
  locale: 'cs',
  activeYear: today.getFullYear(),
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

/**
 * A migration turns the stored object of one version into the shape of the next version. The loop in
 * `migrateToCurrentState` runs them in order and sets the new `version` itself.
 */
export type StateMigration = (value: Record<string, unknown>) => Record<string, unknown>

/**
 * Migrations keyed by the version they start from, e.g. `{ 1: migrateVersion1 }` once version 2 exists.
 * Empty while version 1 is the only version. A stored version without a path to the current one is treated
 * as unknown, and the app starts from the initial state.
 */
export const migrations: Record<number, StateMigration> = {}

const isStoredVersion = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= CURRENT_STATE_VERSION

/**
 * Runs the migrations from a stored version up to the current one.
 *
 * @param {Record<string, unknown>} value a parsed stored or imported state
 * @returns {Record<string, unknown> | undefined} the object at the current version, or undefined when the version is unknown
 */
export const migrateToCurrentState = (value: Record<string, unknown>): Record<string, unknown> | undefined => {
  const storedVersion = value.version
  if (!isStoredVersion(storedVersion)) return undefined
  let current = value
  for (let version = storedVersion; version < CURRENT_STATE_VERSION; version += 1) {
    const migrate = migrations[version]
    if (!migrate) return undefined
    current = { ...migrate(current), version: version + 1 }
  }
  return current
}

/**
 * Turns anything read from storage into a valid state. An unknown or unreadable version gives the initial state.
 *
 * @param {unknown} value parsed JSON from storage
 * @param {object} params
 * @param {Date} params.today used for the default year and the default timestamps
 * @returns {PersistedState}
 */
export const normalizeState = (value: unknown, { today }: { today: Date }): PersistedState => {
  const fallback = initialState({ today })
  const migrated = isRecord(value) ? migrateToCurrentState(value) : undefined
  if (!migrated) return fallback
  return {
    version: CURRENT_STATE_VERSION,
    locale: oneOf(migrated.locale, LOCALES, fallback.locale),
    activeYear: yearOr(migrated.activeYear, fallback.activeYear),
    syncInputs: booleanOr(migrated.syncInputs, fallback.syncInputs),
    sharedInputs: normalizeInputs(migrated.sharedInputs),
    inputsByYear: normalizeYearRecord(migrated.inputsByYear, (entry) => normalizeInputs(entry)),
    customYearData: normalizeYearRecord(migrated.customYearData, (entry, year) => normalizeCustomYearData(entry, { year })),
    useCustomData: normalizeYearRecord(migrated.useCustomData, (entry) => entry === true),
    officialDataPromptAnswered: normalizeYearRecord(migrated.officialDataPromptAnswered, (entry) => entry === true),
    scenarios: normalizeScenarios(migrated.scenarios, { today }),
    hasCompletedSetup: booleanOr(migrated.hasCompletedSetup, fallback.hasCompletedSetup),
    theme: oneOf(migrated.theme, THEMES, fallback.theme),
  }
}
