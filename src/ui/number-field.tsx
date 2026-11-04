import { useEffect, useState } from 'preact/hooks'
import { formatNumber, parseNumberInput } from '../i18n/format'
import { currentLocale } from './locale'

export type NumberFieldProps = {
  id: string
  label: string
  value: number
  onValue: (value: number) => void
  unit?: string
  help?: string
  min?: number
  max?: number
  /** decimals allowed while typing and shown when not focused */
  maximumFractionDigits?: number
  /** extra classes on the wrapper, e.g. 'is-overridden' */
  className?: string
  /** element placed after the input group, e.g. a reset button */
  after?: preact.ComponentChildren
  /** text shown next to the label, e.g. a badge */
  labelAddon?: preact.ComponentChildren
}

const clamp = ({ value, min, max }: { value: number; min?: number; max?: number }) =>
  Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, value))

/**
 * A labelled number input with a numeric keyboard, a unit and optional help text.
 * It keeps the typed text while focused (so "1," is not reformatted mid-typing) and reports every valid
 * number on each keystroke, which keeps results live.
 *
 * @param {NumberFieldProps} props
 */
export const NumberField = ({
  id,
  label,
  value,
  onValue,
  unit,
  help,
  min,
  max,
  maximumFractionDigits = 0,
  className = '',
  after,
  labelAddon,
}: NumberFieldProps) => {
  const format = (number: number) => formatNumber(number, { locale: currentLocale.value, maximumFractionDigits })
  const [text, setText] = useState(format(value))
  const [isFocused, setIsFocused] = useState(false)
  const [hasError, setHasError] = useState(false)

  // follow outside changes (year switch, reset, import) while the user is not typing
  useEffect(() => {
    if (!isFocused) setText(format(value))
  }, [value, isFocused, currentLocale.value])

  const helpId = help ? `${id}-help` : undefined

  return (
    <div class={`field ${className}`.trim()}>
      <div class="row">
        <label for={id}>{label}</label>
        {labelAddon}
      </div>
      <div class="field-control">
        <input
          id={id}
          type="text"
          inputMode={maximumFractionDigits > 0 ? 'decimal' : 'numeric'}
          autoComplete="off"
          value={text}
          aria-describedby={helpId}
          aria-invalid={hasError || undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            setHasError(false)
            setText(format(value))
          }}
          onInput={(event) => {
            const typed = (event.currentTarget as HTMLInputElement).value
            setText(typed)
            const parsed = parseNumberInput(typed)
            if (parsed === null) {
              setHasError(typed.trim() !== '')
              return
            }
            setHasError(false)
            onValue(clamp({ value: parsed, min, max }))
          }}
        />
        {unit ? <span class="field-unit">{unit}</span> : null}
      </div>
      {after}
      {help ? (
        <p class="field-help" id={helpId}>
          {help}
        </p>
      ) : null}
    </div>
  )
}
