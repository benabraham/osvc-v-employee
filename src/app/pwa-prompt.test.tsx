// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PwaPrompt, type ServiceWorkerState } from './pwa-prompt'
import { ToastHost } from './toast-host'
import { toasts } from './toast'

const serviceWorker = (overrides: Partial<ServiceWorkerState> = {}): ServiceWorkerState => ({
  needRefresh: false,
  setNeedRefresh: vi.fn(),
  offlineReady: false,
  setOfflineReady: vi.fn(),
  updateServiceWorker: vi.fn(async () => {}),
  ...overrides,
})

beforeEach(() => {
  toasts.value = []
})

afterEach(() => {
  cleanup()
  toasts.value = []
})

describe('PwaPrompt', () => {
  it('offers a reload when a new version waits, and reloads through the service worker', () => {
    const registration = serviceWorker({ needRefresh: true })
    render(
      <>
        <PwaPrompt registration={registration} />
        <ToastHost />
      </>,
    )
    expect(screen.getByText('Nová verze je k dispozici')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Načíst znovu' }))
    expect(registration.updateServiceWorker).toHaveBeenCalledWith(true)
    expect(registration.setNeedRefresh).toHaveBeenCalledWith(false)
  })

  it('closes the update message without reloading', () => {
    const registration = serviceWorker({ needRefresh: true })
    render(
      <>
        <PwaPrompt registration={registration} />
        <ToastHost />
      </>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Zavřít' }))
    expect(registration.updateServiceWorker).not.toHaveBeenCalled()
    expect(registration.setNeedRefresh).toHaveBeenCalledWith(false)
    expect(screen.queryByText('Nová verze je k dispozici')).toBeNull()
  })

  it('announces that the app works offline, once, and lets the user close it', () => {
    const registration = serviceWorker({ offlineReady: true })
    render(
      <>
        <PwaPrompt registration={registration} />
        <ToastHost />
      </>,
    )
    expect(screen.getByText('Aplikace je připravena offline')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Zavřít' }))
    expect(registration.setOfflineReady).toHaveBeenCalledWith(false)
  })

  it('shows nothing when there is no news', () => {
    const { container } = render(
      <>
        <PwaPrompt registration={serviceWorker()} />
        <ToastHost />
      </>,
    )
    expect(container.querySelector('.toast')).toBeNull()
  })
})
