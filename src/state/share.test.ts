import { describe, expect, it } from 'vitest'
import { defaultInputs, type Inputs } from '../model/inputs'
import { decodeSharedCalculation, encodeSharedCalculation, parseShareHash, shareUrlFor } from './share'

/** Builds a token from raw bytes, to test the decoder with payloads the encoder would never make. */
const encodeBytes = (bytes: Uint8Array) => {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Builds a token from raw JSON text, to test the decoder with payloads the encoder would never make. */
const encodeRaw = (json: string) => encodeBytes(new TextEncoder().encode(json))

/** Reads a share token back to the JSON it carries, without the app's decoder. */
const rawJsonOf = (token: string) => {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

const richInputs = (): Inputs => ({
  ...defaultInputs(),
  workingDays: 240,
  hourlyRate: 1_250,
  usesPausalniDan: true,
  expenseRate: 0.8,
  children: [{ months: 12, hasZtpP: true, preschoolFees: 24_000 }],
  credits: { ...defaultInputs().credits, spouse: true, disability: 'degree3' },
  deductions: { ...defaultInputs().deductions, donations: 2_000 },
  sicknessInsurance: { enabled: true, monthlyAssessmentBase: 9_000 },
  costs: [
    { id: 'notebook', name: 'notebook účetní – 14″ (Česko)', price: 42_000, months: 36 },
    { id: 'education', name: 'vzdělávání (knihy, konference)', price: 10_000, months: 12 },
  ],
  overrides: { taxDeductibleCosts: 50_000, totalLevies: null },
})

describe('encodeSharedCalculation and decodeSharedCalculation', () => {
  it('round-trips the year and the inputs, including Czech characters in cost names', () => {
    const inputs = richInputs()
    const token = encodeSharedCalculation({ year: 2027, inputs })
    expect(decodeSharedCalculation(token)).toEqual({ year: 2027, inputs })
  })

  it('produces base64url without padding', () => {
    const token = encodeSharedCalculation({ year: 2027, inputs: richInputs() })
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('uses compact JSON with the year and only the inputs that differ from the defaults', () => {
    const token = encodeSharedCalculation({ year: 2026, inputs: { ...defaultInputs(), hourlyRate: 700 } })
    expect(rawJsonOf(token)).toBe('{"year":2026,"inputs":{"hourlyRate":700}}')
  })

  it('encodes a link with default inputs as a short token', () => {
    const token = encodeSharedCalculation({ year: 2026, inputs: defaultInputs() })
    expect(rawJsonOf(token)).toBe('{"year":2026,"inputs":{}}')
    expect(token.length).toBeLessThan(40)
  })

  it('encodes a nested change as the nested part that differs', () => {
    const token = encodeSharedCalculation({
      year: 2026,
      inputs: { ...defaultInputs(), credits: { ...defaultInputs().credits, spouse: true } },
    })
    expect(rawJsonOf(token)).toBe('{"year":2026,"inputs":{"credits":{"spouse":true}}}')
  })

  it('decodes a token with only some inputs by filling the rest with the defaults', () => {
    const token = encodeSharedCalculation({ year: 2025, inputs: { ...defaultInputs(), hourlyRate: 700 } })
    expect(decodeSharedCalculation(token)).toEqual({ year: 2025, inputs: { ...defaultInputs(), hourlyRate: 700 } })
  })

  it('round-trips a null working days value and a null override', () => {
    const inputs = { ...defaultInputs(), workingDays: null }
    expect(decodeSharedCalculation(encodeSharedCalculation({ year: 2026, inputs }))!.inputs.workingDays).toBeNull()
  })

  it.each([
    ['empty text', ''],
    ['text with spaces', 'abc def'],
    ['text with padding', 'eyJ5ZWFyIjoyMDI2fQ=='],
    ['text that is not base64', '!!!'],
    ['a length that cannot be base64', 'a'],
    ['valid base64 that is not JSON', 'bm90IGpzb24'],
    ['JSON that is an array', encodeRaw('[1,2]')],
    ['JSON without a year', encodeRaw('{"inputs":{}}')],
    ['a year before 2000', encodeRaw('{"year":1999,"inputs":{}}')],
    ['a year after 2100', encodeRaw('{"year":2101,"inputs":{}}')],
    ['a year that is a string', encodeRaw('{"year":"2026","inputs":{}}')],
    ['a year that is not an integer', encodeRaw('{"year":2026.5,"inputs":{}}')],
    ['bytes that are not UTF-8', encodeBytes(new Uint8Array([0xff, 0xfe, 0x7b]))],
  ])('returns null for %s', (_label, token) => {
    expect(decodeSharedCalculation(token)).toBeNull()
  })

  it('treats wrong input types inside a valid payload as the defaults', () => {
    const token = encodeRaw('{"year":2026,"inputs":{"hourlyRate":"lots","expenseRate":0.5,"unknown":1}}')
    expect(decodeSharedCalculation(token)).toEqual({ year: 2026, inputs: defaultInputs() })
  })
})

describe('shareUrlFor and parseShareHash', () => {
  it('builds a hash link on the base URL', () => {
    const url = shareUrlFor({ baseUrl: 'https://example.test/osvc-v-employee/', year: 2026, inputs: defaultInputs() })
    expect(url).toBe(`https://example.test/osvc-v-employee/#/share/${encodeSharedCalculation({ year: 2026, inputs: defaultInputs() })}`)
  })

  it('parses the hash of a share link back to the payload', () => {
    const inputs = richInputs()
    const url = shareUrlFor({ baseUrl: 'https://example.test/', year: 2027, inputs })
    expect(parseShareHash(url.slice(url.indexOf('#')))).toEqual({ year: 2027, inputs })
  })

  it('also accepts the hash without its leading #', () => {
    const token = encodeSharedCalculation({ year: 2026, inputs: defaultInputs() })
    expect(parseShareHash(`/share/${token}`)).toEqual({ year: 2026, inputs: defaultInputs() })
  })

  it.each(['', '#', '#/calc', '#/share/', '#/share/abc?x=1', '#/share/!!!', '#/share/' + encodeRaw('[]')])('returns null for hash %j', (hash) => {
    expect(parseShareHash(hash)).toBeNull()
  })
})
