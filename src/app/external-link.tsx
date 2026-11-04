import type { ComponentChildren } from 'preact'
import { useT } from './context'

/**
 * A link that opens in a new tab, with the new tab said out loud to screen readers.
 *
 * @param {object} props
 * @param {string} props.href
 * @param {ComponentChildren} props.children the link text
 */
export const ExternalLink = ({ href, children }: { href: string; children: ComponentChildren }) => {
  const t = useT()
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span class="visually-hidden"> {t('shell.opensNewTab')}</span>
    </a>
  )
}
