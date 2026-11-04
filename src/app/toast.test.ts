import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_VISIBLE_TOASTS, TOAST_HIDE_DELAY_MS, dismissToast, showToast, toasts } from './toast'

beforeEach(() => {
  vi.useFakeTimers()
  toasts.value = []
})

afterEach(() => {
  vi.useRealTimers()
  toasts.value = []
})

describe('toast queue', () => {
  it('adds a message and removes it when dismissed, calling its onDismiss once', () => {
    const onDismiss = vi.fn()
    const id = showToast({ messageKey: 'offline.ready', onDismiss })
    expect(toasts.value.map((toast) => toast.messageKey)).toEqual(['offline.ready'])
    dismissToast(id)
    dismissToast(id)
    expect(toasts.value).toEqual([])
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('hides a message without buttons after the delay', () => {
    showToast({ messageKey: 'shell.share.loaded' })
    vi.advanceTimersByTime(TOAST_HIDE_DELAY_MS - 1)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1)
    expect(toasts.value).toEqual([])
  })

  it('keeps a message with buttons until it is closed', () => {
    showToast({ messageKey: 'update.available', actions: [{ labelKey: 'update.reload', run: () => {} }] })
    vi.advanceTimersByTime(TOAST_HIDE_DELAY_MS * 2)
    expect(toasts.value).toHaveLength(1)
  })

  it('makes room for a new message by dropping the oldest and calling its onDismiss', () => {
    const onDismissFirst = vi.fn()
    showToast({ messageKey: 'a', onDismiss: onDismissFirst, actions: [{ labelKey: 'x', run: () => {} }] })
    for (let index = 1; index < MAX_VISIBLE_TOASTS; index += 1) {
      showToast({ messageKey: `m${index}`, actions: [{ labelKey: 'x', run: () => {} }] })
    }
    expect(toasts.value).toHaveLength(MAX_VISIBLE_TOASTS)
    expect(onDismissFirst).not.toHaveBeenCalled()

    showToast({ messageKey: 'newest', actions: [{ labelKey: 'x', run: () => {} }] })
    expect(toasts.value).toHaveLength(MAX_VISIBLE_TOASTS)
    expect(toasts.value.map((toast) => toast.messageKey)).not.toContain('a')
    expect(onDismissFirst).toHaveBeenCalledTimes(1)
  })
})
