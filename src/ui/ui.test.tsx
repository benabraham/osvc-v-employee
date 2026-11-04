// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Money, NumberField, OverrideField, Segmented, Toggle, currentLocale } from '.'

const normalizeSpaces = (text: string | null) => (text ?? '').replace(/[  ]/g, ' ')

afterEach(() => {
  cleanup()
  currentLocale.value = 'cs'
})

describe('Money', () => {
  it('formats Kč in Czech and follows the locale', () => {
    const { container, rerender } = render(<Money value={39_700} />)
    expect(normalizeSpaces(container.textContent)).toBe('39 700 Kč')
    currentLocale.value = 'en'
    rerender(<Money value={39_700} />)
    expect(normalizeSpaces(container.textContent)).toBe('CZK 39,700')
  })

  it('marks approximate values and positive changes', () => {
    const { container } = render(<Money value={300} isApproximate showSign />)
    expect(normalizeSpaces(container.textContent)).toBe('≈ +300 Kč')
  })
})

describe('NumberField', () => {
  it('is labelled, shows help and reports each valid number while typing', () => {
    const onValue = vi.fn()
    render(<NumberField id="rate" label="Hodinová sazba" value={650} onValue={onValue} unit="Kč" help="bez DPH" />)
    const input = screen.getByLabelText('Hodinová sazba') as HTMLInputElement
    expect(input.value).toBe('650')
    expect(input.getAttribute('aria-describedby')).toBe('rate-help')
    fireEvent.focus(input)
    fireEvent.input(input, { target: { value: '1 000' } })
    expect(onValue).toHaveBeenLastCalledWith(1_000)
  })

  it('flags text that is not a number without reporting it', () => {
    const onValue = vi.fn()
    render(<NumberField id="days" label="Dny" value={20} onValue={onValue} />)
    const input = screen.getByLabelText('Dny')
    fireEvent.input(input, { target: { value: 'abc' } })
    expect(onValue).not.toHaveBeenCalled()
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  it('follows a new value from outside even while focused (year switch with the field focused)', () => {
    const { rerender } = render(<NumberField id="rate2" label="Sazba" value={650} onValue={() => {}} />)
    const input = screen.getByLabelText('Sazba') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.input(input, { target: { value: '800' } })
    rerender(<NumberField id="rate2" label="Sazba" value={700} onValue={() => {}} />)
    expect(input.value).toBe('700')
  })

  it('keeps half-typed text that still means the current value', () => {
    const { rerender } = render(<NumberField id="reserve" label="Rezerva" value={1} onValue={() => {}} maximumFractionDigits={2} />)
    const input = screen.getByLabelText('Rezerva') as HTMLInputElement
    fireEvent.focus(input)
    fireEvent.input(input, { target: { value: '1,' } })
    rerender(<NumberField id="reserve" label="Rezerva" value={1} onValue={() => {}} maximumFractionDigits={2} />)
    expect(input.value).toBe('1,')
  })

  it('clamps to the allowed range', () => {
    const onValue = vi.fn()
    render(<NumberField id="months" label="Měsíce" value={12} onValue={onValue} min={0} max={12} />)
    fireEvent.input(screen.getByLabelText('Měsíce'), { target: { value: '15' } })
    expect(onValue).toHaveBeenLastCalledWith(12)
  })
})

describe('OverrideField', () => {
  const props = {
    id: 'levies',
    label: 'Celkem odvody',
    calculatedValue: 110_610,
    onOverride: vi.fn(),
    onReset: vi.fn(),
    overriddenLabel: 'upraveno',
    resetLabel: 'Vrátit výpočet',
  }

  it('shows the calculated value with no reset while not overridden', () => {
    render(<OverrideField {...props} overrideValue={null} />)
    expect(normalizeSpaces((screen.getByLabelText('Celkem odvody') as HTMLInputElement).value)).toBe('110 610')
    expect(screen.queryByText('Vrátit výpočet')).toBeNull()
  })

  it('marks an override and resets it in one tap', () => {
    const onReset = vi.fn()
    render(<OverrideField {...props} overrideValue={100_000} onReset={onReset} />)
    expect(screen.getByText('upraveno')).toBeTruthy()
    fireEvent.click(screen.getByText('Vrátit výpočet'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})

describe('Toggle and Segmented', () => {
  it('toggle is a labelled switch', () => {
    const onChange = vi.fn()
    render(<Toggle id="flat" label="Paušální daň" checked={false} onChange={onChange} />)
    const input = screen.getByRole('switch', { name: 'Paušální daň' })
    fireEvent.click(input)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('segmented reports the chosen option', () => {
    const onChange = vi.fn()
    render(
      <Segmented
        name="rate"
        legend="Sazba výdajů"
        value={0.6}
        onChange={onChange}
        options={[0.3, 0.4, 0.6, 0.8].map((value) => ({ value, label: `${value * 100} %` }))}
      />,
    )
    expect((screen.getByLabelText('60 %') as HTMLInputElement).checked).toBe(true)
    fireEvent.click(screen.getByLabelText('80 %'))
    expect(onChange).toHaveBeenCalledWith(0.8)
  })
})
