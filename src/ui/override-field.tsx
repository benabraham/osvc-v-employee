import { NumberField, type NumberFieldProps } from './number-field'

/**
 * A number field for a value the sheet marks blue: calculated, but the user may override it.
 * An overridden value is visibly marked and has a one-tap reset to the calculated value.
 *
 * @param {object} props
 * @param {number} props.calculatedValue the value the app calculates
 * @param {number | null} props.overrideValue the user's value, or null when not overridden
 * @param {(value: number) => void} props.onOverride
 * @param {() => void} props.onReset
 * @param {string} props.overriddenLabel badge text, e.g. "upraveno"
 * @param {string} props.resetLabel reset button text, e.g. "Vrátit výpočet"
 */
export const OverrideField = ({
  calculatedValue,
  overrideValue,
  onOverride,
  onReset,
  overriddenLabel,
  resetLabel,
  ...fieldProps
}: Omit<NumberFieldProps, 'value' | 'onValue' | 'className' | 'after' | 'labelAddon'> & {
  calculatedValue: number
  overrideValue: number | null
  onOverride: (value: number) => void
  onReset: () => void
  overriddenLabel: string
  resetLabel: string
}) => {
  const isOverridden = overrideValue !== null
  return (
    <NumberField
      {...fieldProps}
      value={overrideValue ?? calculatedValue}
      onValue={onOverride}
      className={isOverridden ? 'is-overridden' : ''}
      labelAddon={isOverridden ? <span class="badge override">{overriddenLabel}</span> : null}
      after={
        isOverridden ? (
          <button type="button" class="button ghost small" onClick={onReset}>
            {resetLabel}
          </button>
        ) : null
      }
    />
  )
}
