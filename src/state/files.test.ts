import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest'
import { downloadTextFile, readTextFile, shareApp, type ShareCapableNavigator } from './files'

type FakeAnchor = { href: string; download: string; clicks: number; removed: boolean; click: () => void; remove: () => void }

/** A document with just the parts downloadTextFile uses. */
const fakeDocument = () => {
  const created: FakeAnchor[] = []
  const appended: FakeAnchor[] = []
  const document = {
    createElement: () => {
      const anchor: FakeAnchor = {
        href: '',
        download: '',
        clicks: 0,
        removed: false,
        click() {
          this.clicks += 1
        },
        remove() {
          this.removed = true
        },
      }
      created.push(anchor)
      return anchor
    },
    body: {
      append: (anchor: FakeAnchor) => {
        appended.push(anchor)
      },
    },
  }
  return { document: document as unknown as Document, created, appended }
}

describe('downloadTextFile', () => {
  let createObjectURL: MockInstance<(object: Blob | MediaSource) => string>
  let revokeObjectURL: MockInstance<(url: string) => void>

  beforeEach(() => {
    createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url')
    revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('clicks a temporary link with the file name and the blob URL, then removes it', () => {
    const { document, created, appended } = fakeDocument()
    downloadTextFile({ filename: 'osvc-2026.json', text: '{"a":1}', document })
    expect(created).toHaveLength(1)
    expect(appended).toEqual(created)
    expect(created[0]).toMatchObject({ href: 'blob:fake-url', download: 'osvc-2026.json', clicks: 1, removed: true })
  })

  it('writes the text as a JSON blob, keeping Czech characters', async () => {
    const { document } = fakeDocument()
    const text = JSON.stringify({ name: 'účetní' })
    downloadTextFile({ filename: 'backup.json', text, document })
    const blob = createObjectURL.mock.calls[0]![0] as Blob
    expect(blob.type).toContain('application/json')
    expect(await blob.text()).toBe(text)
  })

  it('releases the blob URL after the download has started', () => {
    const { document } = fakeDocument()
    downloadTextFile({ filename: 'backup.json', text: '{}', document })
    expect(revokeObjectURL).not.toHaveBeenCalled()
    vi.runOnlyPendingTimers()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url')
  })
})

describe('readTextFile', () => {
  it('returns the text of an uploaded file, keeping Czech characters', async () => {
    const file = new File([JSON.stringify({ name: 'účetní' })], 'backup.json', { type: 'application/json' })
    expect(JSON.parse(await readTextFile(file))).toEqual({ name: 'účetní' })
  })
})

describe('shareApp', () => {
  const url = 'https://example.test/osvc-v-employee/#/share/abc'
  const shareContent = { title: 'OSVČ vs. zaměstnanec', text: 'Můj výpočet' }

  const nativeShare = (behaviour: () => Promise<void> = async () => undefined) => ({ share: vi.fn(behaviour) })
  const clipboard = (behaviour: () => Promise<void> = async () => undefined) => ({ writeText: vi.fn(behaviour) })

  it('uses the system share sheet when it exists and does not touch the clipboard', async () => {
    const share = nativeShare()
    const copy = clipboard()
    const outcome = await shareApp({ navigator: { share: share.share, clipboard: copy } as ShareCapableNavigator, url, ...shareContent })
    expect(outcome).toBe('shared')
    expect(share.share).toHaveBeenCalledWith({ title: shareContent.title, text: shareContent.text, url })
    expect(copy.writeText).not.toHaveBeenCalled()
  })

  it('falls back to copying the link when the share sheet fails for another reason', async () => {
    const copy = clipboard()
    const outcome = await shareApp({
      navigator: { share: async () => Promise.reject(new TypeError('not allowed')), clipboard: copy },
      url,
      ...shareContent,
    })
    expect(outcome).toBe('copied')
    expect(copy.writeText).toHaveBeenCalledWith(url)
  })

  it('reports failed without copying when the user closes the share sheet', async () => {
    const copy = clipboard()
    const cancelled = Object.assign(new Error('Share canceled'), { name: 'AbortError' })
    const outcome = await shareApp({
      navigator: { share: async () => Promise.reject(cancelled), clipboard: copy },
      url,
      ...shareContent,
    })
    expect(outcome).toBe('failed')
    expect(copy.writeText).not.toHaveBeenCalled()
  })

  it('copies the link when only the clipboard exists', async () => {
    const copy = clipboard()
    expect(await shareApp({ navigator: { clipboard: copy }, url, ...shareContent })).toBe('copied')
    expect(copy.writeText).toHaveBeenCalledWith(url)
  })

  it('reports failed when the clipboard refuses', async () => {
    const copy = clipboard(async () => Promise.reject(new Error('denied')))
    expect(await shareApp({ navigator: { clipboard: copy }, url, ...shareContent })).toBe('failed')
  })

  it('reports failed when there is neither a share sheet nor a clipboard', async () => {
    expect(await shareApp({ navigator: {}, url, ...shareContent })).toBe('failed')
  })
})
