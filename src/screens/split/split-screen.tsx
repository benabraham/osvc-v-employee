/**
 * The invoice splitter, the default screen once set up (PRD user story 2, goal: ≤ 10 s from the home screen,
 * one-handed). One big amount field and quick amounts; below it the invoice split into levies, costs, reserve,
 * holiday and what can be spent. The shares are the yearly ones of the calculation (PRD "Calculation rules").
 */
import { useEffect, useState } from 'preact/hooks'
import { store, results, useT } from '../../app/context'
import { formatMoney, formatNumber } from '../../i18n/format'
import type { Locale } from '../../i18n/types'
import type { Translator } from '../../i18n'
import { currentLocale, Money, NumberField, ResultRow } from '../../ui'
import type { Results } from '../../model'
import './split.css'

/** The parts of one invoice, in the order of the split and of the bar. */
type SplitPart = 'levies' | 'costs' | 'reserve' | 'holiday' | 'spend'

type Split = Results['plan']['invoiceSplit']

const SPLIT_PARTS: readonly { part: SplitPart; labelKey: string }[] = [
  { part: 'levies', labelKey: 'split.result.levies' },
  { part: 'costs', labelKey: 'split.result.costs' },
  { part: 'reserve', labelKey: 'split.result.reserve' },
  { part: 'holiday', labelKey: 'split.result.holiday' },
  { part: 'spend', labelKey: 'split.result.spend' },
]

/** The common amounts offered as one-tap chips. */
const QUICK_AMOUNTS = [5_000, 10_000, 20_000, 50_000, 100_000] as const

/** How long "Zkopírováno" stays on screen. */
const COPY_CONFIRMATION_MS = 3_000

/**
 * The split as plain text for the clipboard: a title line, then one "label: amount" line per part.
 *
 * @param {object} params
 * @param {Translator} params.t
 * @param {Locale} params.locale
 * @param {number} params.invoiceAmount
 * @param {Split} params.split
 * @returns {string}
 */
const splitSummaryText = ({
  t,
  locale,
  invoiceAmount,
  split,
}: {
  t: Translator
  locale: Locale
  invoiceAmount: number
  split: Split
}) =>
  [
    t('split.copy.title', { amount: formatMoney(invoiceAmount, locale) }),
    ...SPLIT_PARTS.map(({ part, labelKey }) => `${t(labelKey)}: ${formatMoney(split[part], locale)}`),
  ].join('\n')

/**
 * Width of one part of the bar, in per cent of the invoice; 0 for an empty invoice.
 *
 * @param {object} params
 * @param {number} params.amount
 * @param {number} params.invoiceAmount
 * @returns {string} CSS width, e.g. "16%"
 */
const barWidthFor = ({ amount, invoiceAmount }: { amount: number; invoiceAmount: number }) =>
  invoiceAmount > 0 ? `${(amount / invoiceAmount) * 100}%` : '0%'

/**
 * Copies text with the async clipboard API. Resolves to false when the browser has no clipboard or refuses.
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
  if (!clipboard || typeof clipboard.writeText !== 'function') return false
  try {
    await clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * The stacked bar and the five labelled rows of the split. Colours are only a visual aid: every part has its
 * text label and its amount in the list.
 *
 * @param {object} props
 * @param {Split} props.split
 * @param {number} props.invoiceAmount
 */
const SplitFigures = ({ split, invoiceAmount }: { split: Split; invoiceAmount: number }) => {
  const t = useT()
  return (
    <div class="split-figures" aria-live="polite">
      <div class="split-bar" aria-hidden="true">
        {SPLIT_PARTS.map(({ part }) => (
          <span key={part} data-part={part} style={{ width: barWidthFor({ amount: split[part], invoiceAmount }) }} />
        ))}
      </div>
      <dl class="result-list split-list">
        {SPLIT_PARTS.map(({ part, labelKey }) => {
          const isSpend = part === 'spend'
          return (
            <ResultRow
              key={part}
              isTotal={isSpend}
              label={
                <>
                  <span class="split-swatch" data-part={part} aria-hidden="true" />
                  {t(labelKey)}
                </>
              }
              note={t(isSpend ? 'split.result.spendNote' : 'split.result.roundedNote')}
            >
              <Money value={split[part]} />
            </ResultRow>
          )
        })}
      </dl>
    </div>
  )
}

/**
 * The copy button and its confirmation. The text is read at click time, so it always matches the figures shown.
 *
 * @param {object} props
 * @param {string} props.text the summary to copy
 */
const CopySplitButton = ({ text }: { text: string }) => {
  const t = useT()
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (copyState === 'idle') return
    const timer = setTimeout(() => setCopyState('idle'), COPY_CONFIRMATION_MS)
    return () => clearTimeout(timer)
  }, [copyState])

  const copy = () => {
    void copyToClipboard(text).then((isCopied) => setCopyState(isCopied ? 'copied' : 'failed'))
  }

  const message = copyState === 'copied' ? t('split.copied') : copyState === 'failed' ? t('split.copyFailed') : ''
  return (
    <div class="split-copy">
      <button type="button" class="button secondary" onClick={copy}>
        {t('split.copy')}
      </button>
      <p class="split-copy-status" role="status">
        {message}
      </p>
    </div>
  )
}

/**
 * The invoice splitter: the amount and its quick chips on the left (the first controls of the screen), the
 * split and the notes on the right. Without year data it shows one line only, as the shell explains the rest.
 */
export const SplitScreen = () => {
  const t = useT()
  const locale = currentLocale.value
  const current = results.value
  const { invoiceAmount, hourlyRate } = store.activeInputs.value
  const { hasCompletedSetup } = store.state.value

  if (current === null) {
    return (
      <section class="split-screen">
        <h1>{t('split.title')}</h1>
        <p class="muted">{t('split.noData')}</p>
      </section>
    )
  }

  const split = current.plan.invoiceSplit
  return (
    <section class="split-screen">
      <h1>{t('split.title')}</h1>
      <p class="muted split-context">
        {t('split.context', {
          hourlyRate: `${formatNumber(hourlyRate, { locale })} ${t('unit.czkPerHour')}`,
          year: current.year,
          netMonthly: formatMoney(current.plan.netMonthly, locale),
        })}
      </p>

      <div class="split-layout">
        <div class="stack split-input">
          <NumberField
            id="split-amount"
            label={t('split.amount.label')}
            unit={t('unit.czk')}
            value={invoiceAmount}
            min={0}
            onValue={(amount) => store.setInput('invoiceAmount', amount)}
            className="split-amount"
          />
          <div class="split-chips" role="group" aria-label={t('split.amount.quick')}>
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                class="split-chip"
                aria-pressed={amount === invoiceAmount}
                onClick={() => store.setInput('invoiceAmount', amount)}
              >
                {formatMoney(amount, locale)}
              </button>
            ))}
          </div>
        </div>

        <div class="stack sticky-column">
          <SplitFigures split={split} invoiceAmount={invoiceAmount} />
          <CopySplitButton text={splitSummaryText({ t, locale, invoiceAmount, split })} />
          <div class="card split-note">
            <p>{t('split.explanation')}</p>
            <p>
              <a href="#/calc">{t('split.link.calc')}</a>
            </p>
          </div>
          {hasCompletedSetup ? null : (
            <section class="card split-setup" aria-labelledby="split-setup-title">
              <h2 id="split-setup-title">{t('split.setup.title')}</h2>
              <p>{t('split.setup.text')}</p>
              <div class="row">
                <a class="button secondary" href="#/calc">
                  {t('split.setup.link')}
                </a>
                <button type="button" class="button" onClick={() => store.completeSetup()}>
                  {t('split.setup.done')}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </section>
  )
}
