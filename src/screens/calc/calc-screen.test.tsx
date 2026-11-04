// @vitest-environment happy-dom
import { act, cleanup, fireEvent, render } from '@testing-library/preact'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { store } from '../../app/context'
import { initialState } from '../../state/schema'
import { CalcScreen } from './calc-screen'

const TODAY = new Date('2026-11-04')

/** Czech money uses non-breaking spaces and the locale minus sign; the tests compare plain text. */
const normalise = (text: string | null | undefined) =>
  (text ?? '').replace(/[  ]/g, ' ').replace(/−/g, '-').replace(/\s+/g, ' ').trim()

const resetStore = () => {
  store.state.value = initialState({ today: TODAY })
}

/** Text of the aria-live headline region. */
const headlineText = (container: Element) => normalise(container.querySelector('[aria-live="polite"]')?.textContent)

/** Text of one result row (label and value) from the detailed list. */
const resultRowText = (container: Element, label: string) => {
  const term = Array.from(container.querySelectorAll('dt')).find((item) => item.textContent === label)
  if (!term) throw new Error(`No result row labelled "${label}"`)
  return normalise(term.closest('.result-row')?.textContent)
}

describe('CalcScreen with the 2026 defaults', () => {
  beforeEach(resetStore)
  afterEach(cleanup)

  it('shows the net monthly income, the gross equivalent and the change against 2025 in the live headline', () => {
    const { container } = render(<CalcScreen />)
    const headline = headlineText(container)
    expect(headline).toContain('Čistého měsíčně')
    expect(headline).toContain('39 700 Kč')
    expect(headline).toContain('Odpovídá hrubé mzdě 50 589 Kč')
    expect(headline).toContain('oproti 2025')
  })

  it('shows the figures of the PRD acceptance table in the detailed list', () => {
    const { container } = render(<CalcScreen />)
    const expected: [string, string][] = [
      ['Fakturováno za rok', '695 500 Kč'],
      ['Daňově uznatelné výdaje', '417 300 Kč'],
      ['Základ daně', '278 200 Kč'],
      ['Daň z příjmů', '10 890 Kč'],
      ['Zdravotní pojištění (ZP)', '39 664 Kč'],
      ['Sociální pojištění (SP)', '60 056 Kč'],
      ['Odvody celkem', '110 610 Kč'],
      ['Po zdanění', '584 890 Kč'],
      ['Po zdanění a nákladech', '537 890 Kč'],
      ['Rezerva za rok', '61 120 Kč'],
      ['Dovolená za rok', '38 200 Kč'],
      ['Čistý roční příjem', '477 000 Kč'],
      ['Čistý měsíční příjem', '39 700 Kč'],
      ['Na den', '1 910 Kč'],
    ]
    expected.forEach(([label, value]) => {
      expect(resultRowText(container, label)).toContain(value)
    })
  })

  it('shows the paušální daň hint with the yearly saving', () => {
    const { container } = render(<CalcScreen />)
    expect(normalise(container.textContent)).toContain('Paušální daň by se ti vyplatila o 666 Kč ročně')
  })

  it('recomputes every result when the hourly rate changes', () => {
    const { container, getByLabelText } = render(<CalcScreen />)
    fireEvent.input(getByLabelText('Hodinová sazba'), { target: { value: '1000' } })
    expect(headlineText(container)).toContain('65 100 Kč')
  })

  it('recomputes the tax-deductible costs when the expense rate changes', () => {
    const { container, getByLabelText } = render(<CalcScreen />)
    fireEvent.click(getByLabelText('80 %'))
    expect(resultRowText(container, 'Daňově uznatelné výdaje')).toContain('556 400 Kč')
  })

  it('overrides the total levies, marks the override and restores the calculated value', () => {
    const { container, getByLabelText, getByText, queryByText } = render(<CalcScreen />)
    fireEvent.input(getByLabelText('Odvody celkem'), { target: { value: '100000' } })
    expect(resultRowText(container, 'Odvody celkem')).toContain('100 000 Kč')
    expect(getByText('upraveno')).toBeTruthy()

    fireEvent.click(getByText('Vrátit výpočet', { selector: 'button' }))
    expect(resultRowText(container, 'Odvody celkem')).toContain('110 610 Kč')
    expect(queryByText('upraveno')).toBeNull()
  })

  it('lowers the income tax below zero when a child credit is added (daňový bonus)', () => {
    const { container, getByText } = render(<CalcScreen />)
    fireEvent.click(getByText('Přidat dítě', { selector: 'button' }))
    expect(resultRowText(container, 'Daň z příjmů')).toContain('-4 314 Kč')
    expect(resultRowText(container, 'Daň z příjmů')).toContain('daňový bonus')
  })

  it('shows the working days default and a reset to it after an edit', () => {
    const { container, getByLabelText, getByText } = render(<CalcScreen />)
    expect(normalise(container.textContent)).toContain('výchozí pro 2026: 250')
    fireEvent.input(getByLabelText('Pracovní dny za rok'), { target: { value: '240' } })
    expect((getByLabelText('Pracovní dny za rok') as HTMLInputElement).value).toBe('240')
    fireEvent.click(getByText('Použít výchozí', { selector: 'button' }))
    expect((getByLabelText('Pracovní dny za rok') as HTMLInputElement).value).toBe('250')
  })

  it('shows the minimum voluntary sickness premium when the insurance is switched on', () => {
    const { container, getByLabelText } = render(<CalcScreen />)
    fireEvent.click(getByLabelText('Dobrovolné nemocenské pojištění'))
    expect(resultRowText(container, 'Dobrovolné nemocenské')).toContain('2 916 Kč')
    expect(normalise((getByLabelText('Měsíční vyměřovací základ') as HTMLInputElement).value)).toBe('9 000')
  })

  it('switches to the paušální daň and shows its yearly amount', () => {
    const { container, getByLabelText } = render(<CalcScreen />)
    fireEvent.click(getByLabelText('Uplatňuji paušální daň'))
    expect(resultRowText(container, 'Paušální daň za rok')).toContain('109 944 Kč')
    expect(normalise(container.textContent)).toContain('Při paušální dani se slevy ani odpočty neuplatní')
  })

  it('shows the warning when invoicing is above 1 500 000 Kč and not before', () => {
    const { container, getByLabelText } = render(<CalcScreen />)
    expect(normalise(container.textContent)).not.toContain('1,5 mil. Kč')
    fireEvent.input(getByLabelText('Hodinová sazba'), { target: { value: '2000' } })
    expect(normalise(container.textContent)).toContain('Fakturace je nad 1,5 mil. Kč')
  })

  it('links the reserve card to the costs list', () => {
    const { getByRole } = render(<CalcScreen />)
    const link = getByRole('link', { name: 'Upravit náklady' })
    expect(link.getAttribute('href')).toBe('#/costs')
  })
})

describe('CalcScreen by year', () => {
  beforeEach(resetStore)
  afterEach(cleanup)

  it('shows only a short line for a year without data', () => {
    act(() => store.setActiveYear(2030))
    const { container } = render(<CalcScreen />)
    expect(normalise(container.textContent)).toContain('Pro tento rok nejsou hodnoty')
    expect(normalise(container.textContent)).not.toContain('Čistého měsíčně')
  })

  it('shows the 2027 credits only in the year whose rules include them', () => {
    const { queryByLabelText, getByText } = render(<CalcScreen />)
    expect(queryByLabelText('Měsíce studia')).toBeNull()
    act(() => store.setActiveYear(2027))
    expect(queryByLabelText('Měsíce studia')).not.toBeNull()
    fireEvent.click(getByText('Přidat dítě', { selector: 'button' }))
    expect(queryByLabelText('Školkovné za rok')).not.toBeNull()
  })

  it('shows the surcharge for sales registration only in 2027 with paušální daň on', () => {
    const { queryByLabelText, getByLabelText } = render(<CalcScreen />)
    expect(queryByLabelText('Příplatek místo evidence tržeb')).toBeNull()
    act(() => store.setActiveYear(2027))
    fireEvent.click(getByLabelText('Uplatňuji paušální daň'))
    expect(queryByLabelText('Příplatek místo evidence tržeb')).not.toBeNull()
  })
})

describe('CalcScreen badges', () => {
  beforeEach(resetStore)
  afterEach(cleanup)

  it('marks the headline as unverified for a year whose values are only researched', () => {
    const { container, queryByText } = render(<CalcScreen />)
    expect(queryByText('neověřeno')).toBeNull()
    act(() => store.setActiveYear(2027))
    expect(normalise(container.querySelector('[aria-live="polite"]')?.textContent)).toContain('neověřeno')
  })
})
