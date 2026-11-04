import { describe, expect, it, vi } from 'vitest'
import { EXPORT_APP_MARKER, initialState } from '../../state'
import { appBaseUrlFor, copyText, exportFileNameFor, importProblemFor } from './data-files'

const validExport = (state: unknown) => JSON.stringify({ app: EXPORT_APP_MARKER, exportedAt: '2026-11-04T10:00:00.000Z', state })

describe('exportFileNameFor', () => {
  it('names the backup by its local date, as osvc-v-zamestnanec-YYYY-MM-DD.json', () => {
    expect(exportFileNameFor({ today: new Date(2026, 10, 4, 23, 30) })).toBe('osvc-v-zamestnanec-2026-11-04.json')
  })

  it('pads the month and the day', () => {
    expect(exportFileNameFor({ today: new Date(2027, 0, 9) })).toBe('osvc-v-zamestnanec-2027-01-09.json')
  })
})

describe('appBaseUrlFor', () => {
  it('is the origin and path, without the hash, so the app opens at its start', () => {
    expect(appBaseUrlFor({ origin: 'https://example.org', pathname: '/osvc-v-employee/' })).toBe(
      'https://example.org/osvc-v-employee/',
    )
  })
})

describe('copyText', () => {
  it('writes the text to the clipboard and reports success', async () => {
    const writeText = vi.fn(async () => undefined)
    await expect(copyText({ clipboard: { writeText }, text: 'https://x/#/share/abc' })).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('https://x/#/share/abc')
  })

  it('reports failure when there is no clipboard', async () => {
    await expect(copyText({ clipboard: undefined, text: 'x' })).resolves.toBe(false)
  })

  it('reports failure when the clipboard refuses', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('denied')
    })
    await expect(copyText({ clipboard: { writeText }, text: 'x' })).resolves.toBe(false)
  })
})

describe('importProblemFor', () => {
  it('finds nothing wrong with an export of this app', () => {
    expect(importProblemFor({ text: validExport(initialState({ today: new Date('2026-11-04') })) })).toBeUndefined()
  })

  it('reports text that is not JSON', () => {
    expect(importProblemFor({ text: 'not json {' })).toBe('invalidJson')
  })

  it('reports JSON that is not an export of this app', () => {
    expect(importProblemFor({ text: JSON.stringify({ app: 'something-else', state: {} }) })).toBe('invalidFormat')
    expect(importProblemFor({ text: '[1, 2, 3]' })).toBe('invalidFormat')
  })

  it('reports an export whose state has a version this app cannot read', () => {
    expect(importProblemFor({ text: validExport({ version: 99 }) })).toBe('invalidFormat')
  })
})
