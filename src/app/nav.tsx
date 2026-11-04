import { ROUTES, type Route } from './router'
import { NavIcon } from './icons'
import { useT } from './context'

/**
 * The main navigation: a bottom bar on phones, a column on desktop. Each link is a hash link, so it works
 * without script, and the active screen carries aria-current.
 *
 * @param {object} props
 * @param {Route} props.current the screen on show
 */
export const AppNav = ({ current }: { current: Route }) => {
  const t = useT()
  return (
    <nav class="app-nav" aria-label={t('nav.main')}>
      {ROUTES.map((name) => (
        <a key={name} href={`#/${name}`} aria-current={name === current ? 'page' : undefined}>
          <NavIcon route={name} />
          <span>{t(`nav.${name}`)}</span>
        </a>
      ))}
    </nav>
  )
}
