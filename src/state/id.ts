/**
 * A new random id for a cost row, a scenario or a normalized row without one. Uses `crypto.randomUUID`
 * where the browser has it (secure contexts) and falls back to time plus randomness elsewhere.
 *
 * @returns {string}
 */
export const createId = (): string => {
  const uuid = typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : undefined
  return uuid ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}
