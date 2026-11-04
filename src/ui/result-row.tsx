/**
 * One line of a result list (<dl class="result-list">): label on the left, value on the right.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {preact.ComponentChildren} props.children the value, usually <Money />
 * @param {string} [props.note] small text under the value, e.g. "15,9 % z fakturace"
 * @param {boolean} [props.isTotal] emphasised row
 */
export const ResultRow = ({
  label,
  children,
  note,
  isTotal = false,
}: {
  label: preact.ComponentChildren
  children: preact.ComponentChildren
  note?: preact.ComponentChildren
  isTotal?: boolean
}) => (
  <div class={`result-row${isTotal ? ' is-total' : ''}`}>
    <dt>{label}</dt>
    <dd>
      {children}
      {note ? <span class="result-note">{note}</span> : null}
    </dd>
  </div>
)
