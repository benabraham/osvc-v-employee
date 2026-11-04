/**
 * Share links: one calculation (year and inputs) packed into the URL hash. Nothing is sent to a server.
 * The payload is compact JSON in base64url, and carries only the inputs that differ from the defaults.
 */
import { defaultInputs, type Inputs } from '../model/inputs'
import { isRecord, isValidYear, normalizeInputs } from './schema'

/** One calculation as it travels in a link. */
export type SharedCalculation = { year: number; inputs: Inputs }

const SHARE_HASH_PATTERN = /^#?\/share\/([A-Za-z0-9_-]+)$/

/**
 * Whether two JSON-like values hold the same data, whatever the key order.
 *
 * @param {unknown} left
 * @param {unknown} right
 * @returns {boolean}
 */
const isDeepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => isDeepEqual(item, right[index]))
  }
  if (isRecord(left) && isRecord(right)) {
    const keys = Object.keys(left)
    return keys.length === Object.keys(right).length && keys.every((key) => key in right && isDeepEqual(left[key], right[key]))
  }
  return false
}

/**
 * The part of `value` that differs from `base`: objects are compared key by key, anything else as a whole.
 *
 * @param {unknown} value
 * @param {unknown} base
 * @returns {unknown} undefined when nothing differs
 */
const differenceFrom = (value: unknown, base: unknown): unknown => {
  if (isRecord(value) && isRecord(base)) {
    const changedEntries = Object.entries(value).flatMap(([key, item]) => {
      const difference = differenceFrom(item, base[key])
      return difference === undefined ? [] : [[key, difference] as const]
    })
    return changedEntries.length > 0 ? Object.fromEntries(changedEntries) : undefined
  }
  return isDeepEqual(value, base) ? undefined : value
}

const toBase64Url = (bytes: Uint8Array) => {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Throws when the text is not base64url; the caller turns that into null. */
const fromBase64Url = (token: string) => {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

/**
 * Encodes a calculation for a share link. Inputs equal to the defaults are left out, so a link with default
 * inputs is only the year.
 *
 * @param {SharedCalculation} calculation
 * @returns {string} base64url of compact JSON, without padding
 */
export const encodeSharedCalculation = ({ year, inputs }: SharedCalculation): string => {
  const changedInputs = differenceFrom(inputs, defaultInputs())
  const json = JSON.stringify({ year, inputs: changedInputs ?? {} })
  return toBase64Url(new TextEncoder().encode(json))
}

/**
 * Decodes a share token. Anything malformed gives null: wrong encoding, invalid UTF-8, not an object, a year
 * outside 2000–2100. Inputs that are missing or have the wrong type take their defaults.
 *
 * @param {string} token the part after `#/share/`
 * @returns {SharedCalculation | null}
 */
export const decodeSharedCalculation = (token: string): SharedCalculation | null => {
  if (!/^[A-Za-z0-9_-]+$/.test(token)) return null
  try {
    const json = new TextDecoder('utf-8', { fatal: true }).decode(fromBase64Url(token))
    const payload: unknown = JSON.parse(json)
    if (!isRecord(payload) || !isValidYear(payload.year)) return null
    return { year: payload.year, inputs: normalizeInputs(payload.inputs) }
  } catch {
    return null
  }
}

/**
 * The link that opens a calculation in the app.
 *
 * @param {object} params
 * @param {string} params.baseUrl the app's URL without a hash, e.g. the GitHub Pages address
 * @param {number} params.year
 * @param {Inputs} params.inputs
 * @returns {string}
 */
export const shareUrlFor = ({ baseUrl, year, inputs }: { baseUrl: string; year: number; inputs: Inputs }): string =>
  `${baseUrl}#/share/${encodeSharedCalculation({ year, inputs })}`

/**
 * The calculation in a URL hash, if the hash is a share link.
 *
 * @param {string} hash e.g. "#/share/eyJ..." (the # is optional)
 * @returns {SharedCalculation | null}
 */
export const parseShareHash = (hash: string): SharedCalculation | null => {
  const match = SHARE_HASH_PATTERN.exec(hash)
  const token = match?.[1]
  return token ? decodeSharedCalculation(token) : null
}
