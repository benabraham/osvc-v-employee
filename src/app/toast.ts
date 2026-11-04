/**
 * The messages at the bottom of the screen (shared-link confirmation, update prompt, offline notice). The queue
 * lives here so any module can show a message; `ToastHost` in toast.tsx draws it.
 */
import { signal } from '@preact/signals'
import type { MessageParams } from '../i18n'

/** A button on a toast. It runs once and then the toast closes. */
export type ToastAction = { labelKey: string; run: () => void }

/** What a caller passes to `showToast`. */
export type ToastInput = {
  /** dotted key of the message in the bundles, so the text follows the language */
  messageKey: string
  params?: MessageParams
  /** buttons after the message; a toast with buttons stays until it is closed */
  actions?: ToastAction[]
  /** called once when the toast leaves: closed, after an action, or after its timeout */
  onDismiss?: () => void
}

/** A toast in the queue. */
export type ToastMessage = ToastInput & { id: number }

/** Messages on screen, oldest first. */
export const toasts = signal<ToastMessage[]>([])

/** How long a toast without buttons stays on screen, in milliseconds. */
export const TOAST_HIDE_DELAY_MS = 6_000

/** At most this many toasts at once; the oldest one makes room for a new one. */
export const MAX_VISIBLE_TOASTS = 3

let lastToastId = 0

/**
 * Removes a toast and calls its `onDismiss`. Does nothing for an id that is no longer shown.
 *
 * @param {number} id
 */
export const dismissToast = (id: number): void => {
  const current = toasts.peek()
  const dismissed = current.find((toast) => toast.id === id)
  if (!dismissed) return
  toasts.value = current.filter((toast) => toast.id !== id)
  dismissed.onDismiss?.()
}

/**
 * Shows a message. A toast without buttons hides itself after `TOAST_HIDE_DELAY_MS`.
 *
 * @param {ToastInput} input
 * @returns {number} the id of the toast
 */
export const showToast = (input: ToastInput): number => {
  lastToastId += 1
  const id = lastToastId
  const current = toasts.peek()
  const overflow = current.length + 1 - MAX_VISIBLE_TOASTS
  current.slice(0, Math.max(0, overflow)).forEach((toast) => dismissToast(toast.id))
  toasts.value = [...toasts.peek(), { ...input, id }]
  if (!input.actions?.length) setTimeout(() => dismissToast(id), TOAST_HIDE_DELAY_MS)
  return id
}
