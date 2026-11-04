import { useState } from 'preact/hooks'
import { TAX_YEARS } from '../data/tax-years'
import { store, useT } from './context'
import { CustomYearForm } from './custom-year-form'
import { activeYear } from './shell-state'
import { yearNoticeFor } from './year-notice'

/**
 * The notice at the top of a screen when the active year has no official values yet, or when the user's own
 * numbers and newly published official ones are both there and the switch question is open. The custom-values
 * form opens below the notice.
 */
export const YearDataNotice = () => {
  const t = useT()
  const year = activeYear.value
  const [formYear, setFormYear] = useState<number | undefined>(undefined)
  const notice = yearNoticeFor({
    hasOfficialData: TAX_YEARS[year] !== undefined,
    hasCustomData: store.state.value.customYearData[String(year)] !== undefined,
    isUsingCustomData: store.isUsingCustomData.value,
    isOfficialPromptAnswered: store.state.value.officialDataPromptAnswered[String(year)] === true,
  })
  const isFormOpen = formYear === year
  const currentYear = store.yearWindow.value.find((info) => info.kind === 'current')?.year

  if (notice === 'none' && !isFormOpen) return null

  return (
    <div class="stack year-notice">
      {notice === 'none' ? null : (
        <section class="notice">
          {notice === 'missing' ? (
            <>
              <p>{t('shell.year.missing', { year })}</p>
              <div class="row">
                <button
                  type="button"
                  class="button secondary"
                  onClick={() => {
                    if (currentYear !== undefined) store.setActiveYear(currentYear)
                  }}
                >
                  {t('shell.year.wait')}
                </button>
                <button type="button" class="button" onClick={() => setFormYear(year)}>
                  {t('shell.year.enterOwn')}
                </button>
              </div>
            </>
          ) : null}
          {notice === 'customInUse' ? (
            <>
              <p>{t('shell.year.customInUse', { year })}</p>
              <div class="row">
                <button type="button" class="button secondary" onClick={() => setFormYear(year)}>
                  {t('shell.year.editOwn')}
                </button>
              </div>
            </>
          ) : null}
          {notice === 'officialAvailable' ? (
            <>
              <p>{t('shell.year.officialAvailable', { year })}</p>
              <div class="row">
                <button type="button" class="button" onClick={() => store.answerOfficialDataPrompt(year, true)}>
                  {t('shell.year.switchYes')}
                </button>
                <button type="button" class="button secondary" onClick={() => store.answerOfficialDataPrompt(year, false)}>
                  {t('shell.year.switchNo')}
                </button>
              </div>
            </>
          ) : null}
        </section>
      )}
      {isFormOpen ? <CustomYearForm key={year} year={year} onDone={() => setFormYear(undefined)} /> : null}
    </div>
  )
}
