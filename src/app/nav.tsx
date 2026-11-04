import { useEffect, useState } from 'preact/hooks'
import { ROUTES, type Route } from './router'
import { NavIcon } from './icons'
import { useT } from './context'

/** Screens in the phone's bottom bar; the rest sit behind "Více". On desktop every screen is listed. */
export const PRIMARY_ROUTES: readonly Route[] = ['split', 'calc', 'costs', 'scenarios']

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
)

/**
 * The main navigation: a bottom bar with four screens and a "Více" menu on phones, a full column on desktop.
 * Each link is a hash link, and the active screen carries aria-current.
 *
 * @param {object} props
 * @param {Route} props.current the screen on show
 */
export const AppNav = ({ current }: { current: Route }) => {
  const t = useT()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const isCurrentSecondary = !PRIMARY_ROUTES.includes(current)

  // close the menu after navigating
  useEffect(() => setIsMoreOpen(false), [current])

  return (
    <nav class={`app-nav${isMoreOpen ? ' is-more-open' : ''}`} aria-label={t('nav.main')}>
      {ROUTES.map((name) => (
        <a
          key={name}
          href={`#/${name}`}
          class={PRIMARY_ROUTES.includes(name) ? 'nav-primary' : 'nav-secondary'}
          aria-current={name === current ? 'page' : undefined}
        >
          <NavIcon route={name} />
          <span>{t(`nav.${name}`)}</span>
        </a>
      ))}
      <button
        type="button"
        class={`nav-more${isCurrentSecondary ? ' is-active' : ''}`}
        aria-expanded={isMoreOpen}
        onClick={() => setIsMoreOpen(!isMoreOpen)}
      >
        <MoreIcon />
        <span>{t('nav.more')}</span>
      </button>
    </nav>
  )
}
