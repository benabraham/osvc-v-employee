/**
 * A row of mutually exclusive choices (radio buttons styled as segments).
 *
 * @template T
 * @param {object} props
 * @param {string} props.name radio group name, unique on the page
 * @param {string} props.legend
 * @param {{ value: T, label: string }[]} props.options
 * @param {T} props.value
 * @param {(value: T) => void} props.onChange
 */
export const Segmented = <T extends string | number>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string
  legend: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) => (
  <fieldset class="segmented">
    <legend>{legend}</legend>
    {options.map((option) => (
      <label key={String(option.value)}>
        <input
          type="radio"
          name={name}
          value={String(option.value)}
          checked={option.value === value}
          onChange={() => onChange(option.value)}
        />
        <span>{option.label}</span>
      </label>
    ))}
  </fieldset>
)
