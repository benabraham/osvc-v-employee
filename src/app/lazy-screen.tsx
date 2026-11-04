import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

type ScreenComponent = () => JSX.Element

/**
 * A screen loaded on first use, so the initial bundle carries only the default screens (PRD budget:
 * 50 KB of JS gzipped). The service worker precaches every chunk, so lazy screens still work offline.
 *
 * @param {object} params
 * @param {() => Promise<ScreenComponent>} params.load imports the module and returns the screen
 * @returns {{ Screen: ScreenComponent, preload: () => Promise<ScreenComponent> }}
 */
export const lazyScreen = ({ load }: { load: () => Promise<ScreenComponent> }) => {
  let loaded: ScreenComponent | undefined
  let pending: Promise<ScreenComponent> | undefined

  const preload = () => {
    pending ??= load().then((component) => {
      loaded = component
      return component
    })
    return pending
  }

  const Screen = () => {
    const [component, setComponent] = useState<ScreenComponent | undefined>(() => loaded)
    useEffect(() => {
      if (component) return
      let isActive = true
      preload().then((next) => {
        if (isActive) setComponent(() => next)
      })
      return () => {
        isActive = false
      }
    }, [component])
    const Loaded = component
    return Loaded ? <Loaded /> : <p class="muted" aria-busy="true">…</p>
  }

  return { Screen, preload }
}
