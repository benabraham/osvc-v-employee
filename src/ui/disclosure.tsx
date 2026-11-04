/**
 * A collapsible section (native <details>), collapsed by default.
 *
 * @param {object} props
 * @param {preact.ComponentChildren} props.summary always visible header
 * @param {boolean} [props.isOpen=false] initially open
 */
export const Disclosure = ({
  summary,
  children,
  isOpen = false,
}: {
  summary: preact.ComponentChildren
  children: preact.ComponentChildren
  isOpen?: boolean
}) => (
  <details class="disclosure" open={isOpen}>
    <summary>{summary}</summary>
    <div class="disclosure-body stack">{children}</div>
  </details>
)
