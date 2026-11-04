import { useState } from 'preact/hooks'
import { store, useT } from '../../app/context'
import { shareApp, shareUrlFor, type ShareOutcome } from '../../state'
import { appBaseUrlFor, copyText } from './data-files'

/** The message of the last share or copy action; each one has its own key in data.result.*. */
type Notice = ShareOutcome | 'copyFailed'

const noticeKeys: Record<Notice, string> = {
  shared: 'data.result.shared',
  copied: 'data.result.copied',
  failed: 'data.result.failed',
  copyFailed: 'data.result.copyFailed',
}

/** The address of the app and of the active year's calculation, read when the section renders. */
const currentShareUrl = (): string =>
  shareUrlFor({
    baseUrl: appBaseUrlFor({ origin: window.location.origin, pathname: window.location.pathname }),
    year: store.state.value.activeYear,
    inputs: store.activeInputs.value,
  })

/**
 * Sharing: the link to the active year's calculation (its inputs in the URL hash), and the app itself.
 * Both use the share sheet when the browser has one, otherwise the clipboard (PRD user story 9).
 */
export const SharingSection = () => {
  const t = useT()
  const [calculationNotice, setCalculationNotice] = useState<Notice | null>(null)
  const [appNotice, setAppNotice] = useState<Notice | null>(null)
  const url = currentShareUrl()
  const activeYear = store.state.value.activeYear
  const appUrl = appBaseUrlFor({ origin: window.location.origin, pathname: window.location.pathname })

  const shareCalculation = async () => {
    const outcome = await shareApp({
      navigator,
      url,
      title: t('app.name'),
      text: t('data.share.explain'),
    })
    setCalculationNotice(outcome)
  }

  const copyCalculation = async () => {
    const isCopied = await copyText({ clipboard: navigator.clipboard, text: url })
    setCalculationNotice(isCopied ? 'copied' : 'copyFailed')
  }

  const shareTheApp = async () => {
    const outcome = await shareApp({ navigator, url: appUrl, title: t('app.name'), text: t('data.app.text') })
    setAppNotice(outcome)
  }

  return (
    <section class="card stack" aria-labelledby="data-share-heading">
      <h2 id="data-share-heading">{t('data.share.heading')}</h2>
      <p class="muted">{t('data.share.explain')}</p>
      <div class="field">
        <label for="data-share-link">{t('data.share.linkLabel')}</label>
        <input id="data-share-link" class="share-link-input" type="text" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
        <p class="field-help">{t('data.share.yearNote', { year: activeYear })}</p>
      </div>
      <div class="row">
        <button type="button" class="button" onClick={shareCalculation}>
          {t('data.share.button')}
        </button>
        <button type="button" class="button secondary" onClick={copyCalculation}>
          {t('data.share.copy')}
        </button>
      </div>
      <p role="status" class="small muted">{calculationNotice ? t(noticeKeys[calculationNotice]) : ''}</p>

      <h3>{t('data.app.heading')}</h3>
      <p class="muted">{t('data.app.explain')}</p>
      <div class="row">
        <button type="button" class="button secondary" onClick={shareTheApp}>
          {t('data.app.button')}
        </button>
      </div>
      <p role="status" class="small muted">{appNotice ? t(noticeKeys[appNotice]) : ''}</p>
    </section>
  )
}
