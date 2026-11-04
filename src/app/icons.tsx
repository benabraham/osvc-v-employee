/**
 * Inline SVG icons: the navigation icons (one per screen) and the close cross. Decorative, so hidden from
 * assistive technology; the labels sit next to them.
 */
import type { JSX } from 'preact'
import type { Route } from './router'

/**
 * The icon frame: 24 px square, stroked with the current text colour.
 *
 * @param {object} props
 * @param {JSX.Element} props.children the shapes
 */
const IconFrame = ({ children }: { children: JSX.Element }) => (
  <svg
    class="app-icon"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
)

/** The shapes of each screen's icon. Functions, so each render gets fresh elements. */
const SHAPES: Record<Route, () => JSX.Element> = {
  split: () => (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  calc: () => (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </>
  ),
  costs: () => (
    <>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  scenarios: () => (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  reverse: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  benefits: () => <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-1.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  data: () => (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  about: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
}

/**
 * The icon of a screen.
 *
 * @param {object} props
 * @param {Route} props.route
 */
export const NavIcon = ({ route }: { route: Route }) => {
  const Shapes = SHAPES[route]
  return (
    <IconFrame>
      <Shapes />
    </IconFrame>
  )
}

/** A cross, for closing a message. */
export const CloseIcon = () => (
  <IconFrame>
    <path d="M6 6l12 12M18 6 6 18" />
  </IconFrame>
)
