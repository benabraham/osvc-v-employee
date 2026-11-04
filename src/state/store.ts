/**
 * The app state as Preact signals, with the actions the screens call. Created by `createStore`, so each
 * test (or each app instance) gets its own store. Every change is written to storage by one effect.
 */
import { computed, effect, signal, type ReadonlySignal, type Signal } from '@preact/signals'
import { TAX_YEARS, taxYearWindow, yearInfoFor, type TaxYearData } from '../data/tax-years'
import { defaultInputs, type CostItem, type Inputs } from '../model/inputs'
import { createId } from './id'
import {
  EXPORT_APP_MARKER,
  isRecord,
  isValidYear,
  migrateToCurrentState,
  normalizeCustomYearData,
  normalizeInputs,
  normalizeState,
  type Locale,
  type PersistedState,
  type Scenario,
  type Theme,
} from './schema'
import { loadState, saveState, type StorageLike } from './storage'
import type { SharedCalculation } from './share'

/** The result of an import: ok, or the reason it was refused (nothing is changed then). */
export type ImportResult = { ok: true } | { ok: false; error: 'invalidJson' | 'invalidFormat' }

/** The values the sheet marks blue, which the user can override. */
export type OverrideKey = keyof Inputs['overrides']

/** One year of the window: its kind (historical, current, next) and whether official data exists. */
export type YearInfo = ReturnType<typeof yearInfoFor>

export type AppStore = {
  /** the whole persisted state; the store writes it to storage after each change */
  state: Signal<PersistedState>
  /** inputs of the active year (the shared set when sync is on) */
  activeInputs: ReadonlySignal<Inputs>
  /** data of the active year: the user's own numbers when enabled, else the official data, else undefined */
  activeYearData: ReadonlySignal<TaxYearData | undefined>
  /** the four years around today, oldest first */
  yearWindow: ReadonlySignal<YearInfo[]>
  /** whether the active year is calculated with the user's own numbers */
  isUsingCustomData: ReadonlySignal<boolean>

  setActiveYear: (year: number) => void
  /** Replaces the inputs of the active year (or the shared set) with what the updater returns. */
  updateInputs: (updater: (inputs: Inputs) => Inputs) => void
  setInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void
  /** Clears one override, so the value is calculated again. */
  resetOverride: (key: OverrideKey) => void
  /** Adds an empty cost row and returns its id. */
  addCost: () => string
  updateCost: (id: string, patch: Partial<Omit<CostItem, 'id'>>) => void
  removeCost: (id: string) => void
  /**
   * Turning sync on copies the active year into the shared set; turning it off copies the shared set into
   * every year of the window. Setting the value it already has changes nothing.
   */
  setSyncInputs: (on: boolean) => void
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
  /** Saves a snapshot of the active year and its inputs, and returns it. */
  saveScenario: (name: string) => Scenario
  renameScenario: (id: string, name: string) => void
  deleteScenario: (id: string) => void
  /** Switches to the scenario's year and makes its inputs the active inputs. */
  loadScenario: (id: string) => void
  /** Stores the user's own numbers for a year. They are used only once `setUseCustomData` turns them on. */
  setCustomYearData: (year: number, data: TaxYearData) => void
  setUseCustomData: (year: number, on: boolean) => void
  /** Records the answer to "switch to the official values?" and sets the switch to match it. */
  answerOfficialDataPrompt: (year: number, useOfficial: boolean) => void
  completeSetup: () => void
  /** Replaces the whole state with an export of this app. */
  importState: (json: string) => ImportResult
  /** Pretty JSON of the whole state, with the app marker and the export time. */
  exportState: () => string
  /** Opens a shared calculation: its year becomes active and its inputs are written for that year. */
  applySharedCalculation: (payload: SharedCalculation) => void
  /** Stops the storage effect. */
  dispose: () => void
}

/** The inputs of a year: the shared set when sync is on, otherwise that year's entry or the defaults. */
const inputsForYear = ({ current, year }: { current: PersistedState; year: number }): Inputs =>
  current.syncInputs ? current.sharedInputs : (current.inputsByYear[String(year)] ?? defaultInputs())

/** The state with `inputs` written where the year's inputs live (the shared set when sync is on). */
const withInputsForYear = ({ current, year, inputs }: { current: PersistedState; year: number; inputs: Inputs }): PersistedState =>
  current.syncInputs
    ? { ...current, sharedInputs: inputs }
    : { ...current, inputsByYear: { ...current.inputsByYear, [String(year)]: inputs } }

/** Whether a year is calculated with the user's own numbers: switched on, and some exist. */
const isCustomDataInUse = ({ current, year }: { current: PersistedState; year: number }) =>
  current.useCustomData[String(year)] === true && current.customYearData[String(year)] !== undefined

/** The data a year is calculated with: the user's own numbers when in use, else the official data. */
const yearDataFor = ({ current, year }: { current: PersistedState; year: number }): TaxYearData | undefined =>
  isCustomDataInUse({ current, year }) ? current.customYearData[String(year)] : TAX_YEARS[year]

/**
 * Creates a store around the state in `storage`. Nothing is written until the state changes, so stored data
 * that this build cannot read stays in place until the user does something.
 *
 * @param {object} params
 * @param {StorageLike} params.storage window.localStorage in the app, a fake in tests
 * @param {Date} params.today decides the year window and the default year
 * @returns {AppStore}
 */
export const createStore = ({ storage, today }: { storage: StorageLike; today: Date }): AppStore => {
  const state: Signal<PersistedState> = signal(loadState({ storage, today }))
  const windowYears = taxYearWindow({ today })

  const activeInputs = computed(() => inputsForYear({ current: state.value, year: state.value.activeYear }))
  const activeYearData = computed(() => yearDataFor({ current: state.value, year: state.value.activeYear }))
  const isUsingCustomData = computed(() => isCustomDataInUse({ current: state.value, year: state.value.activeYear }))
  const yearWindow = computed(() => windowYears.map((year) => yearInfoFor({ year, today })))

  let isFirstRun = true
  const stopSaving = effect(() => {
    const snapshot = state.value
    if (isFirstRun) {
      isFirstRun = false
      return
    }
    saveState({ storage, state: snapshot })
  })

  const update = (change: (current: PersistedState) => PersistedState) => {
    state.value = change(state.peek())
  }

  const updateInputs = (updater: (inputs: Inputs) => Inputs) => {
    update((current) =>
      withInputsForYear({
        current,
        year: current.activeYear,
        inputs: updater(inputsForYear({ current, year: current.activeYear })),
      }),
    )
  }

  const setActiveYear = (year: number) => {
    if (!isValidYear(year)) return
    update((current) => ({ ...current, activeYear: year }))
  }

  const setInput = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    updateInputs((inputs) => ({ ...inputs, [key]: value }))
  }

  const resetOverride = (key: OverrideKey) => {
    updateInputs((inputs) => ({ ...inputs, overrides: { ...inputs.overrides, [key]: null } }))
  }

  const addCost = () => {
    const id = createId()
    updateInputs((inputs) => ({ ...inputs, costs: [...inputs.costs, { id, name: '', price: 0, months: 12 }] }))
    return id
  }

  const updateCost = (id: string, patch: Partial<Omit<CostItem, 'id'>>) => {
    updateInputs((inputs) => ({
      ...inputs,
      costs: inputs.costs.map((cost) => (cost.id === id ? { ...cost, ...patch, id: cost.id } : cost)),
    }))
  }

  const removeCost = (id: string) => {
    updateInputs((inputs) => ({ ...inputs, costs: inputs.costs.filter((cost) => cost.id !== id) }))
  }

  const setSyncInputs = (on: boolean) => {
    const current = state.peek()
    if (current.syncInputs === on) return
    if (on) {
      state.value = { ...current, syncInputs: true, sharedInputs: inputsForYear({ current, year: current.activeYear }) }
      return
    }
    const copiedToWindow = Object.fromEntries(windowYears.map((year) => [String(year), current.sharedInputs]))
    state.value = { ...current, syncInputs: false, inputsByYear: { ...current.inputsByYear, ...copiedToWindow } }
  }

  const setLocale = (locale: Locale) => {
    update((current) => ({ ...current, locale }))
  }

  const setTheme = (theme: Theme) => {
    update((current) => ({ ...current, theme }))
  }

  const saveScenario = (name: string): Scenario => {
    const current = state.peek()
    const scenario: Scenario = {
      id: createId(),
      name,
      year: current.activeYear,
      inputs: inputsForYear({ current, year: current.activeYear }),
      createdAt: new Date().toISOString(),
    }
    state.value = { ...current, scenarios: [...current.scenarios, scenario] }
    return scenario
  }

  const renameScenario = (id: string, name: string) => {
    update((current) => ({
      ...current,
      scenarios: current.scenarios.map((scenario) => (scenario.id === id ? { ...scenario, name } : scenario)),
    }))
  }

  const deleteScenario = (id: string) => {
    update((current) => ({ ...current, scenarios: current.scenarios.filter((scenario) => scenario.id !== id) }))
  }

  const loadScenario = (id: string) => {
    const current = state.peek()
    const scenario = current.scenarios.find((item) => item.id === id)
    if (!scenario) return
    state.value = {
      ...withInputsForYear({ current, year: scenario.year, inputs: scenario.inputs }),
      activeYear: scenario.year,
    }
  }

  const setCustomYearData = (year: number, data: TaxYearData) => {
    if (!isValidYear(year)) return
    update((current) => ({
      ...current,
      customYearData: { ...current.customYearData, [String(year)]: normalizeCustomYearData(data, { year }) },
    }))
  }

  const setUseCustomData = (year: number, on: boolean) => {
    if (!isValidYear(year)) return
    update((current) => ({ ...current, useCustomData: { ...current.useCustomData, [String(year)]: on } }))
  }

  const answerOfficialDataPrompt = (year: number, useOfficial: boolean) => {
    if (!isValidYear(year)) return
    update((current) => ({
      ...current,
      officialDataPromptAnswered: { ...current.officialDataPromptAnswered, [String(year)]: true },
      useCustomData: { ...current.useCustomData, [String(year)]: !useOfficial },
    }))
  }

  const completeSetup = () => {
    update((current) => ({ ...current, hasCompletedSetup: true }))
  }

  const importState = (json: string): ImportResult => {
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch {
      return { ok: false, error: 'invalidJson' }
    }
    if (!isRecord(parsed) || parsed.app !== EXPORT_APP_MARKER || !isRecord(parsed.state)) {
      return { ok: false, error: 'invalidFormat' }
    }
    if (!migrateToCurrentState(parsed.state)) return { ok: false, error: 'invalidFormat' }
    state.value = normalizeState(parsed.state, { today })
    return { ok: true }
  }

  const exportState = () =>
    JSON.stringify({ app: EXPORT_APP_MARKER, exportedAt: new Date().toISOString(), state: state.peek() }, null, 2)

  const applySharedCalculation = (payload: SharedCalculation) => {
    if (!isValidYear(payload.year)) return
    const inputs = normalizeInputs(payload.inputs)
    update((current) => ({
      ...withInputsForYear({ current, year: payload.year, inputs }),
      activeYear: payload.year,
    }))
  }

  return {
    state,
    activeInputs,
    activeYearData,
    yearWindow,
    isUsingCustomData,
    setActiveYear,
    updateInputs,
    setInput,
    resetOverride,
    addCost,
    updateCost,
    removeCost,
    setSyncInputs,
    setLocale,
    setTheme,
    saveScenario,
    renameScenario,
    deleteScenario,
    loadScenario,
    setCustomYearData,
    setUseCustomData,
    answerOfficialDataPrompt,
    completeSetup,
    importState,
    exportState,
    applySharedCalculation,
    dispose: stopSaving,
  }
}
