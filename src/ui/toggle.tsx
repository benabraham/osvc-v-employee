/**
 * An on/off switch built on a native checkbox (keyboard and screen reader support for free).
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onChange
 * @param {string} [props.help]
 */
export const Toggle = ({
  id,
  label,
  checked,
  onChange,
  help,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  help?: string
}) => (
  <div class="field">
    <label class="toggle" for={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        aria-describedby={help ? `${id}-help` : undefined}
        onChange={(event) => onChange((event.currentTarget as HTMLInputElement).checked)}
      />
      <span>{label}</span>
    </label>
    {help ? (
      <p class="field-help" id={`${id}-help`}>
        {help}
      </p>
    ) : null}
  </div>
)
