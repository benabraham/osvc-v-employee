import { describe, expect, it } from 'vitest'
import { TAX_YEARS } from '../../data/tax-years'
import { computeResults, defaultInputs, type Inputs } from '../../model'
import type { Scenario } from '../../state'
import {
  bestColumnIdsFor,
  comparisonColumnsFor,
  metricValueFor,
  resultsForScenario,
  type ComparisonColumn,
} from './scenario-results'

const scenarioWith = ({ id, name, year = 2026, hourlyRate }: { id: string; name: string; year?: number; hourlyRate: number }): Scenario => ({
  id,
  name,
  year,
  inputs: { ...defaultInputs(), hourlyRate },
  createdAt: '2026-11-04T10:00:00.000Z',
})

const columnFor = ({ id, name, hourlyRate, year = 2026 }: { id: string; name: string; hourlyRate: number; year?: number }): ComparisonColumn => {
  const inputs: Inputs = { ...defaultInputs(), hourlyRate }
  const data = TAX_YEARS[year]
  return { id, name, year, inputs, results: data ? computeResults({ inputs, data }) : null }
}

describe('resultsForScenario', () => {
  it('computes the scenario with the official data of its year', () => {
    const scenario = scenarioWith({ id: 'a', name: '650', hourlyRate: 650 })
    const results = resultsForScenario({ scenario })
    expect(results?.plan.netMonthly).toBe(computeResults({ inputs: scenario.inputs, data: TAX_YEARS[2026]! }).plan.netMonthly)
  })

  it('gives null for a year without data, so the screen can flag it', () => {
    expect(resultsForScenario({ scenario: scenarioWith({ id: 'a', name: 'old', year: 2030, hourlyRate: 650 }) })).toBeNull()
  })
})

describe('comparisonColumnsFor', () => {
  it('puts the current calculation first, then the scenarios in saved order', () => {
    const current = columnFor({ id: 'current', name: 'Aktuální výpočet', hourlyRate: 700 })
    const columns = comparisonColumnsFor({
      current,
      scenarios: [scenarioWith({ id: 'b', name: 'B', hourlyRate: 800 }), scenarioWith({ id: 'a', name: 'A', hourlyRate: 650 })],
    })
    expect(columns.map((column) => column.id)).toEqual(['current', 'b', 'a'])
    expect(columns.map((column) => column.name)).toEqual(['Aktuální výpočet', 'B', 'A'])
  })
})

describe('bestColumnIdsFor', () => {
  it('picks the column with the highest net monthly income', () => {
    const columns = [columnFor({ id: 'x', name: '650', hourlyRate: 650 }), columnFor({ id: 'y', name: '800', hourlyRate: 800 })]
    expect(bestColumnIdsFor({ columns })).toEqual(['y'])
  })

  it('gives every column that ties for the highest net income', () => {
    const columns = [columnFor({ id: 'x', name: 'one', hourlyRate: 650 }), columnFor({ id: 'y', name: 'two', hourlyRate: 650 })]
    expect(bestColumnIdsFor({ columns })).toEqual(['x', 'y'])
  })

  it('ignores columns without results and gives none when fewer than two have results', () => {
    const withoutData = { ...columnFor({ id: 'x', name: 'old', hourlyRate: 650 }), results: null }
    expect(bestColumnIdsFor({ columns: [withoutData, columnFor({ id: 'y', name: '800', hourlyRate: 800 })] })).toEqual([])
    expect(bestColumnIdsFor({ columns: [withoutData] })).toEqual([])
  })
})

describe('metricValueFor', () => {
  it('reads the rate and the expense rate from the inputs, even without results', () => {
    const column = { ...columnFor({ id: 'x', name: 'old', hourlyRate: 650, year: 2030 }) }
    expect(metricValueFor({ metric: 'hourlyRate', column })).toEqual({ kind: 'hourlyRate', amount: 650 })
    expect(metricValueFor({ metric: 'expenseRate', column })).toEqual({ kind: 'percent', share: 0.6 })
    expect(metricValueFor({ metric: 'pausalniDan', column })).toEqual({ kind: 'yesNo', value: false })
  })

  it('gives missing for the calculated values when the year has no data', () => {
    const column = columnFor({ id: 'x', name: 'old', hourlyRate: 650, year: 2030 })
    expect(metricValueFor({ metric: 'netMonthly', column })).toEqual({ kind: 'missing' })
  })

  it('gives the net monthly income and marks the gross equivalent as approximate', () => {
    const column = columnFor({ id: 'x', name: '650', hourlyRate: 650 })
    expect(metricValueFor({ metric: 'netMonthly', column })).toEqual({ kind: 'money', amount: column.results?.plan.netMonthly, isApproximate: false })
    expect(metricValueFor({ metric: 'grossEquivalent', column })).toEqual({
      kind: 'money',
      amount: column.results?.grossEquivalent.grossWage,
      isApproximate: true,
    })
  })
})
