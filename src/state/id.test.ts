import { afterEach, describe, expect, it, vi } from 'vitest'
import { createId } from './id'

describe('createId', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses crypto.randomUUID when the browser has it', () => {
    expect(createId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('falls back to a non-empty unique string without crypto.randomUUID', () => {
    vi.stubGlobal('crypto', undefined)
    const ids = new Set(Array.from({ length: 50 }, () => createId()))
    expect(ids.size).toBe(50)
    for (const id of ids) expect(id).not.toBe('')
  })
})
