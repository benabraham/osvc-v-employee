// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { store } from '../../app/context'
import { EXPORT_APP_MARKER, initialState, parseShareHash } from '../../state'
import { downloadTextFile } from '../../state/files'
import { DataScreen } from './data-screen'

vi.mock('../../state/files', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../state/files')>()),
  downloadTextFile: vi.fn(),
}))

const linkField = () => screen.getByLabelText('Odkaz na tento výpočet') as HTMLInputElement

const chooseFile = (content: string) => {
  const input = screen.getByLabelText('Soubor se zálohou')
  const file = new File([content], 'backup.json', { type: 'application/json' })
  fireEvent.change(input, { target: { files: [file] } })
}

beforeEach(() => {
  store.state.value = initialState({ today: new Date('2026-11-04') })
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('share my calculation', () => {
  it('puts a link with the inputs of the active year into a read-only field, and the link round-trips', () => {
    store.setInput('hourlyRate', 800)
    render(<DataScreen />)
    const field = linkField()
    expect(field.readOnly).toBe(true)
    const shared = parseShareHash(new URL(field.value).hash)
    expect(shared).toEqual({ year: 2026, inputs: store.activeInputs.value })
  })

  it('explains that the link holds only the inputs and nothing is stored on a server', () => {
    render(<DataScreen />)
    expect(screen.getByText('Odkaz obsahuje jen tvoje vstupy; nic se neukládá na server.')).toBeTruthy()
  })

  it('shares the link through the share sheet when the browser has one', async () => {
    const share = vi.fn(async () => undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Sdílet odkaz' }))
    await waitFor(() => expect(screen.getByText('Sdíleno.')).toBeTruthy())
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: linkField().value }))
  })

  it('copies the link to the clipboard when there is no share sheet', async () => {
    const writeText = vi.fn(async () => undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Sdílet odkaz' }))
    await waitFor(() => expect(screen.getByText('Odkaz je zkopírovaný do schránky.')).toBeTruthy())
    expect(writeText).toHaveBeenCalledWith(linkField().value)
  })

  it('copies the link with the copy button and reports a refusal', async () => {
    const writeText = vi.fn(async () => {
      throw new Error('denied')
    })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Kopírovat odkaz' }))
    await waitFor(() => expect(screen.getByText('Kopírování se nepodařilo. Odkaz můžeš označit a zkopírovat ručně.')).toBeTruthy())
  })
})

describe('share the app', () => {
  it('shares the app title and its address without the hash', async () => {
    const share = vi.fn(async () => undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Sdílet aplikaci' }))
    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'OSVČ vs. zaměstnanec',
        url: `${window.location.origin}${window.location.pathname}`,
      }),
    )
  })
})

describe('export and import', () => {
  it('exports the whole state as a JSON file named by the date, with the app marker', () => {
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Exportovat data' }))
    expect(downloadTextFile).toHaveBeenCalledTimes(1)
    const [{ filename, text }] = vi.mocked(downloadTextFile).mock.calls[0] as [{ filename: string; text: string }]
    expect(filename).toMatch(/^osvc-v-zamestnanec-\d{4}-\d{2}-\d{2}\.json$/)
    const parsed = JSON.parse(text) as { app: string; state: { locale: string } }
    expect(parsed.app).toBe(EXPORT_APP_MARKER)
    expect(parsed.state.locale).toBe('cs')
  })

  it('asks for confirmation before an import replaces the data, and imports after Pokračovat', async () => {
    const backup = { ...initialState({ today: new Date('2026-11-04') }), activeYear: 2025 }
    render(<DataScreen />)
    chooseFile(JSON.stringify({ app: EXPORT_APP_MARKER, exportedAt: '2026-11-01T00:00:00.000Z', state: backup }))

    expect(await screen.findByText('Import nahradí všechna tvoje data. Pokračovat?')).toBeTruthy()
    expect(store.state.value.activeYear).toBe(2026)

    fireEvent.click(screen.getByRole('button', { name: 'Pokračovat' }))
    await waitFor(() => expect(store.state.value.activeYear).toBe(2025))
    expect(screen.getByText('Data byla naimportována.')).toBeTruthy()
    expect(screen.queryByText('Import nahradí všechna tvoje data. Pokračovat?')).toBeNull()
  })

  it('leaves the data alone when the import is cancelled', async () => {
    const backup = { ...initialState({ today: new Date('2026-11-04') }), activeYear: 2025 }
    render(<DataScreen />)
    chooseFile(JSON.stringify({ app: EXPORT_APP_MARKER, state: backup }))
    await screen.findByText('Import nahradí všechna tvoje data. Pokračovat?')

    fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }))
    expect(screen.queryByText('Import nahradí všechna tvoje data. Pokračovat?')).toBeNull()
    expect(store.state.value.activeYear).toBe(2026)
  })

  it('refuses a file that is not JSON, without asking for confirmation', async () => {
    render(<DataScreen />)
    chooseFile('not json {')
    expect(await screen.findByText('Soubor není platný JSON. Nic se nezměnilo.')).toBeTruthy()
    expect(screen.queryByText('Import nahradí všechna tvoje data. Pokračovat?')).toBeNull()
  })

  it('refuses JSON that is not a backup of this app', async () => {
    render(<DataScreen />)
    chooseFile(JSON.stringify({ app: 'somebody-else', state: {} }))
    expect(await screen.findByText('Soubor není zálohou této aplikace. Nic se nezměnilo.')).toBeTruthy()
  })
})

describe('settings', () => {
  it('calls the store when the sync switch changes, and the state follows', () => {
    const setSyncInputs = vi.spyOn(store, 'setSyncInputs')
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('switch', { name: 'Synchronizovat vstupy mezi roky' }))
    expect(setSyncInputs).toHaveBeenCalledWith(true)
    expect(store.state.value.syncInputs).toBe(true)
  })

  it('sets the language and the theme in the store', () => {
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('radio', { name: 'English' }))
    expect(store.state.value.locale).toBe('en')
    fireEvent.click(screen.getByRole('radio', { name: 'Tmavý' }))
    expect(store.state.value.theme).toBe('dark')
  })
})

describe('delete all data', () => {
  it('deletes everything after the inline confirmation', async () => {
    store.setLocale('en')
    store.setInput('hourlyRate', 900)
    render(<DataScreen />)

    fireEvent.click(screen.getByRole('button', { name: 'Smazat všechna data' }))
    expect(screen.getByText('Opravdu smazat všechna data? Tuto akci nelze vrátit.')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Smazat' }))

    expect(store.state.value.locale).toBe('cs')
    expect(store.activeInputs.value.hourlyRate).toBe(650)
    expect(screen.getByText('Všechna data jsou smazaná.')).toBeTruthy()
  })

  it('keeps the data when the deletion is cancelled', () => {
    store.setInput('hourlyRate', 900)
    render(<DataScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Smazat všechna data' }))
    fireEvent.click(screen.getByRole('button', { name: 'Zrušit' }))
    expect(store.activeInputs.value.hourlyRate).toBe(900)
    expect(screen.queryByText('Opravdu smazat všechna data? Tuto akci nelze vrátit.')).toBeNull()
  })
})
