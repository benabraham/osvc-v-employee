import { describe, expect, it } from 'vitest'
import { defaultInputs } from '../model/inputs'
import { customYearDataFor, TAX_YEARS } from '../data/tax-years'
import { createStore } from './store'
import { initialState, normalizeInputs } from './schema'
import { STORAGE_KEY } from './storage'

const today = new Date(2026, 10, 4, 10, 0, 0)

const fakeStorage = (entries: Record<string, string> = {}) => {
  const map = new Map(Object.entries(entries))
  return { map, getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value) }
}

const makeStore = ({ storage = fakeStorage(), now = today }: { storage?: ReturnType<typeof fakeStorage>; now?: Date } = {}) => ({
  storage,
  store: createStore({ storage, today: now }),
})

const storedState = (storage: ReturnType<typeof fakeStorage>) => JSON.parse(storage.map.get(STORAGE_KEY)!)

describe('derived values', () => {
  it('starts in the current year with default inputs and the official data for it', () => {
    const { store } = makeStore()
    expect(store.state.value.activeYear).toBe(2026)
    expect(store.activeInputs.value).toEqual(defaultInputs())
    expect(store.activeYearData.value).toBe(TAX_YEARS[2026])
    expect(store.isUsingCustomData.value).toBe(false)
  })

  it('lists the four years of the window with their kind and whether they have data', () => {
    const { store } = makeStore()
    expect(store.yearWindow.value).toEqual([
      { year: 2024, kind: 'historical', hasData: true },
      { year: 2025, kind: 'historical', hasData: true },
      { year: 2026, kind: 'current', hasData: true },
      { year: 2027, kind: 'next', hasData: true },
    ])
  })

  it('shows the next year without data as a window year with no data', () => {
    const { store } = makeStore({ now: new Date(2027, 2, 1) })
    expect(store.yearWindow.value.map((entry) => entry.year)).toEqual([2025, 2026, 2027, 2028])
    expect(store.yearWindow.value[3]).toEqual({ year: 2028, kind: 'next', hasData: false })
  })
})

describe('per-year inputs', () => {
  it('keeps each year its own inputs', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    expect(store.activeInputs.value.hourlyRate).toBe(500)
    store.setActiveYear(2026)
    expect(store.activeInputs.value.hourlyRate).toBe(defaultInputs().hourlyRate)
    store.setActiveYear(2025)
    expect(store.activeInputs.value.hourlyRate).toBe(500)
  })

  it('ignores a year that is not a valid year', () => {
    const { store } = makeStore()
    store.setActiveYear(1999)
    store.setActiveYear(Number.NaN)
    expect(store.state.value.activeYear).toBe(2026)
  })

  it('updateInputs writes the updated inputs of the active year', () => {
    const { store } = makeStore()
    store.setActiveYear(2024)
    store.updateInputs((inputs) => ({ ...inputs, vacationDays: 25 }))
    expect(store.state.value.inputsByYear['2024']!.vacationDays).toBe(25)
    expect(store.state.value.sharedInputs.vacationDays).toBe(defaultInputs().vacationDays)
  })
})

describe('sync inputs across years', () => {
  it('turning sync on copies the active year into the shared set', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    store.setSyncInputs(true)
    expect(store.state.value.syncInputs).toBe(true)
    expect(store.state.value.sharedInputs.hourlyRate).toBe(500)
    store.setActiveYear(2026)
    expect(store.activeInputs.value.hourlyRate).toBe(500)
  })

  it('with sync on, every year reads and writes the shared set and leaves per-year entries alone', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    store.setSyncInputs(true)
    store.setActiveYear(2026)
    store.setInput('hourlyRate', 700)
    store.setActiveYear(2025)
    expect(store.activeInputs.value.hourlyRate).toBe(700)
    expect(store.state.value.inputsByYear['2025']!.hourlyRate).toBe(500)
  })

  it('turning sync off copies the shared set into every year of the window', () => {
    const { store } = makeStore()
    store.setSyncInputs(true)
    store.setInput('hourlyRate', 700)
    store.setSyncInputs(false)
    for (const year of [2024, 2025, 2026, 2027]) {
      expect(store.state.value.inputsByYear[String(year)]!.hourlyRate).toBe(700)
    }
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 300)
    store.setActiveYear(2026)
    expect(store.activeInputs.value.hourlyRate).toBe(700)
  })

  it('turning sync off when it is already off does not overwrite the per-year inputs', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    store.setSyncInputs(false)
    expect(store.state.value.inputsByYear['2025']!.hourlyRate).toBe(500)
  })

  it('turning sync on when it is already on keeps the shared set', () => {
    const { store } = makeStore()
    store.setSyncInputs(true)
    store.setInput('hourlyRate', 700)
    store.setSyncInputs(true)
    expect(store.state.value.sharedInputs.hourlyRate).toBe(700)
  })
})

describe('overrides', () => {
  it('reset clears one override and keeps the other', () => {
    const { store } = makeStore()
    store.setInput('overrides', { taxDeductibleCosts: 12_000, totalLevies: 30_000 })
    store.resetOverride('taxDeductibleCosts')
    expect(store.activeInputs.value.overrides).toEqual({ taxDeductibleCosts: null, totalLevies: 30_000 })
    store.resetOverride('totalLevies')
    expect(store.activeInputs.value.overrides).toEqual({ taxDeductibleCosts: null, totalLevies: null })
  })
})

describe('costs', () => {
  it('addCost appends an empty row with a new id and returns the id', () => {
    const { store } = makeStore()
    const id = store.addCost()
    expect(store.activeInputs.value.costs).toHaveLength(defaultInputs().costs.length + 1)
    expect(store.activeInputs.value.costs.at(-1)).toEqual({ id, name: '', price: 0, months: 12 })
  })

  it('gives every added row a different id', () => {
    const { store } = makeStore()
    const ids = [store.addCost(), store.addCost(), store.addCost()]
    expect(new Set(ids).size).toBe(3)
  })

  it('updateCost changes only the given fields of that row', () => {
    const { store } = makeStore()
    store.updateCost('accountant', { price: 6_000, name: 'účetní (rok 2027)' })
    const updated = store.activeInputs.value.costs.find((cost) => cost.id === 'accountant')
    expect(updated).toEqual({ id: 'accountant', name: 'účetní (rok 2027)', price: 6_000, months: 12 })
  })

  it('updateCost with an unknown id changes nothing', () => {
    const { store } = makeStore()
    const before = store.activeInputs.value.costs
    store.updateCost('missing', { price: 1 })
    expect(store.activeInputs.value.costs).toEqual(before)
  })

  it('removeCost deletes the row', () => {
    const { store } = makeStore()
    store.removeCost('software')
    expect(store.activeInputs.value.costs.map((cost) => cost.id)).toEqual(['hardware', 'accountant', 'education'])
  })
})

describe('settings', () => {
  it('stores the locale and the theme', () => {
    const { store, storage } = makeStore()
    store.setLocale('en')
    store.setTheme('dark')
    expect(store.state.value.locale).toBe('en')
    expect(store.state.value.theme).toBe('dark')
    expect(storedState(storage)).toMatchObject({ locale: 'en', theme: 'dark' })
  })

  it('completeSetup marks the first-run setup as done', () => {
    const { store } = makeStore()
    store.completeSetup()
    expect(store.state.value.hasCompletedSetup).toBe(true)
  })
})

describe('scenarios', () => {
  it('saveScenario snapshots the active year and inputs, not a live reference', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    const scenario = store.saveScenario('Plán A')
    store.setInput('hourlyRate', 900)
    expect(store.state.value.scenarios).toEqual([scenario])
    expect(scenario).toMatchObject({ name: 'Plán A', year: 2025 })
    expect(scenario.inputs.hourlyRate).toBe(500)
    expect(new Date(scenario.createdAt).toISOString()).toBe(scenario.createdAt)
  })

  it('gives each scenario its own id', () => {
    const { store } = makeStore()
    const first = store.saveScenario('A')
    const second = store.saveScenario('B')
    expect(first.id).not.toBe(second.id)
    expect(store.state.value.scenarios.map((scenario) => scenario.name)).toEqual(['A', 'B'])
  })

  it('renameScenario and deleteScenario change only that scenario', () => {
    const { store } = makeStore()
    const keep = store.saveScenario('keep')
    const drop = store.saveScenario('drop')
    store.renameScenario(keep.id, 'kept')
    store.deleteScenario(drop.id)
    expect(store.state.value.scenarios.map((scenario) => [scenario.id, scenario.name])).toEqual([[keep.id, 'kept']])
  })

  it('loadScenario sets the scenario year and its inputs as the active inputs', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    const scenario = store.saveScenario('2025 plan')
    store.setActiveYear(2026)
    store.setInput('hourlyRate', 900)
    store.loadScenario(scenario.id)
    expect(store.state.value.activeYear).toBe(2025)
    expect(store.activeInputs.value.hourlyRate).toBe(500)
    expect(store.state.value.inputsByYear['2026']!.hourlyRate).toBe(900)
  })

  it('loadScenario with sync on writes the shared set', () => {
    const { store } = makeStore()
    store.setActiveYear(2025)
    store.setInput('hourlyRate', 500)
    const scenario = store.saveScenario('plan')
    store.setSyncInputs(true)
    store.setInput('hourlyRate', 900)
    store.loadScenario(scenario.id)
    expect(store.state.value.sharedInputs.hourlyRate).toBe(500)
  })

  it('loadScenario with an unknown id changes nothing', () => {
    const { store } = makeStore()
    store.loadScenario('missing')
    expect(store.state.value.activeYear).toBe(2026)
  })
})

describe('custom year data', () => {
  const customData = (averageWage: number) => ({ ...customYearDataFor({ year: 2028 }), averageWage })

  it('a year without official data shows nothing until the user enables their own numbers', () => {
    const { store } = makeStore()
    store.setActiveYear(2028)
    expect(store.activeYearData.value).toBeUndefined()
    store.setCustomYearData(2028, customData(60_000))
    expect(store.activeYearData.value).toBeUndefined()
    store.setUseCustomData(2028, true)
    expect(store.activeYearData.value?.averageWage).toBe(60_000)
    expect(store.isUsingCustomData.value).toBe(true)
    store.setUseCustomData(2028, false)
    expect(store.activeYearData.value).toBeUndefined()
  })

  it('custom data for a year with official data replaces the official values only when enabled', () => {
    const { store } = makeStore()
    store.setCustomYearData(2026, customData(55_000))
    expect(store.activeYearData.value).toBe(TAX_YEARS[2026])
    store.setUseCustomData(2026, true)
    expect(store.activeYearData.value?.averageWage).toBe(55_000)
    expect(TAX_YEARS[2026]!.averageWage).not.toBe(55_000)
  })

  it('enabling custom data without any custom values keeps the official values', () => {
    const { store } = makeStore()
    store.setUseCustomData(2026, true)
    expect(store.activeYearData.value).toBe(TAX_YEARS[2026])
    expect(store.isUsingCustomData.value).toBe(false)
  })

  it('stores custom data under the year it is given for', () => {
    const { store } = makeStore()
    store.setCustomYearData(2028, { ...customData(60_000), year: 2025 })
    expect(store.state.value.customYearData['2028']!.year).toBe(2028)
  })

  it('answerOfficialDataPrompt records the answer and sets the switch', () => {
    const { store } = makeStore()
    store.answerOfficialDataPrompt(2027, false)
    expect(store.state.value.officialDataPromptAnswered).toEqual({ '2027': true })
    expect(store.state.value.useCustomData).toEqual({ '2027': true })
    store.answerOfficialDataPrompt(2027, true)
    expect(store.state.value.useCustomData).toEqual({ '2027': false })
  })
})

describe('persistence', () => {
  it('saves after each change', () => {
    const { store, storage } = makeStore()
    store.setLocale('en')
    expect(storedState(storage)).toMatchObject({ version: 1, locale: 'en' })
  })

  it('loads the stored state when created', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...initialState({ today }), activeYear: 2025, locale: 'en' }) })
    const { store } = makeStore({ storage })
    expect(store.state.value.activeYear).toBe(2025)
    expect(store.state.value.locale).toBe('en')
  })

  it('does not overwrite stored data on creation, so an unknown version survives until the user changes something', () => {
    const stored = JSON.stringify({ version: 2, locale: 'en' })
    const storage = fakeStorage({ [STORAGE_KEY]: stored })
    const { store } = makeStore({ storage })
    expect(store.state.value.locale).toBe('cs')
    expect(storage.map.get(STORAGE_KEY)).toBe(stored)
  })

  it('starts from the initial state when the stored data is corrupted', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{broken' })
    const { store } = makeStore({ storage })
    expect(store.state.value).toEqual(initialState({ today }))
  })

  it('keeps working when the storage refuses to write', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    const store = createStore({ storage, today })
    expect(() => store.setLocale('en')).not.toThrow()
    expect(store.state.value.locale).toBe('en')
  })

  it('stops saving after dispose', () => {
    const { store, storage } = makeStore()
    store.dispose()
    store.setLocale('en')
    expect(storage.map.has(STORAGE_KEY)).toBe(false)
  })
})

describe('export and import', () => {
  it('exportState writes pretty JSON with the app marker, the export time and the state', () => {
    const { store } = makeStore()
    store.setLocale('en')
    const parsed = JSON.parse(store.exportState())
    expect(parsed).toMatchObject({ app: 'osvc-v-employee', state: { version: 1, locale: 'en' } })
    expect(new Date(parsed.exportedAt).toISOString()).toBe(parsed.exportedAt)
    expect(store.exportState()).toContain('\n  "app"')
  })

  it('importState restores an export on another store', () => {
    const source = makeStore().store
    source.setActiveYear(2025)
    source.setInput('hourlyRate', 500)
    source.saveScenario('kept')
    source.setSyncInputs(true)
    const target = makeStore().store
    expect(target.importState(source.exportState())).toEqual({ ok: true })
    expect(target.state.value).toEqual(source.state.value)
  })

  it('importState writes the imported state to storage', () => {
    const source = makeStore().store
    source.setLocale('en')
    const { store, storage } = makeStore()
    store.importState(source.exportState())
    expect(storedState(storage)).toMatchObject({ locale: 'en' })
  })

  it('importState normalizes the imported values', () => {
    const json = JSON.stringify({
      app: 'osvc-v-employee',
      state: { version: 1, locale: 'en', sharedInputs: { hourlyRate: 'x', expenseRate: 0.5 } },
    })
    const { store } = makeStore()
    expect(store.importState(json)).toEqual({ ok: true })
    expect(store.state.value.locale).toBe('en')
    expect(store.state.value.sharedInputs).toEqual(normalizeInputs({}))
  })

  it.each([
    ['broken JSON', '{"app": ', 'invalidJson'],
    ['an array', '[]', 'invalidFormat'],
    ['a string', '"osvc-v-employee"', 'invalidFormat'],
    ['null', 'null', 'invalidFormat'],
    ['JSON from another app', JSON.stringify({ app: 'other', state: { version: 1 } }), 'invalidFormat'],
    ['an object without the marker', JSON.stringify({ state: { version: 1 } }), 'invalidFormat'],
    ['a marker without a state', JSON.stringify({ app: 'osvc-v-employee' }), 'invalidFormat'],
    ['a state of an unknown version', JSON.stringify({ app: 'osvc-v-employee', state: { version: 2 } }), 'invalidFormat'],
    ['a state without a version', JSON.stringify({ app: 'osvc-v-employee', state: { locale: 'en' } }), 'invalidFormat'],
  ])('importState rejects %s', (_label, json, error) => {
    const { store } = makeStore()
    store.setLocale('en')
    expect(store.importState(json)).toEqual({ ok: false, error })
    expect(store.state.value.locale).toBe('en')
  })
})

describe('applySharedCalculation', () => {
  it('opens the shared year with the shared inputs', () => {
    const { store } = makeStore()
    store.applySharedCalculation({ year: 2025, inputs: { ...defaultInputs(), hourlyRate: 700 } })
    expect(store.state.value.activeYear).toBe(2025)
    expect(store.activeInputs.value.hourlyRate).toBe(700)
    expect(store.state.value.inputsByYear['2025']!.hourlyRate).toBe(700)
  })

  it('with sync on, the shared inputs are replaced', () => {
    const { store } = makeStore()
    store.setSyncInputs(true)
    store.applySharedCalculation({ year: 2027, inputs: { ...defaultInputs(), hourlyRate: 800 } })
    expect(store.state.value.sharedInputs.hourlyRate).toBe(800)
  })

  it('ignores a payload with an invalid year', () => {
    const { store } = makeStore()
    store.applySharedCalculation({ year: 1999, inputs: defaultInputs() })
    expect(store.state.value.activeYear).toBe(2026)
  })
})
