import { TAX_YEARS } from '../data/tax-years'
import { formatDate } from '../i18n'
import { store, useT } from './context'
import { ExternalLink } from './external-link'
import { currentLocale } from '../ui/locale'
import { activeYear } from './shell-state'

/** The year sheets the calculation is based on, with the links from the PRD. */
export const SHEET_LINKS = [
  { year: 2024, url: 'https://docs.google.com/spreadsheets/d/1wfhBbUzv8sMiuCf-oo80_URYs3F4mzMobcK0b1-nYIA' },
  { year: 2025, url: 'https://docs.google.com/spreadsheets/d/1dKazO_2dM4fmQjwkbrB5eEHh4XQw4tXFcYzgcc7EKNo' },
  { year: 2026, url: 'https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s' },
] as const

/** The issue tracker, where problems are reported. */
export const ISSUES_URL = 'https://github.com/benabraham/osvc-v-employee/issues'

/** The repository. */
export const REPOSITORY_URL = 'https://github.com/benabraham/osvc-v-employee'

/**
 * The page footer: the permanent disclaimer, the date the active year's values are valid from, flags for a year
 * without values or a past year, and the links to the sheets, the bug tracker and the source code.
 */
export const AppFooter = () => {
  const t = useT()
  const year = activeYear.value
  const data = store.activeYearData.value
  const currentYear = store.yearWindow.value.find((info) => info.kind === 'current')?.year
  const isMissingCurrent = data === undefined && year === currentYear
  const isHistorical = currentYear !== undefined && year < currentYear && year in TAX_YEARS

  return (
    <footer class="app-footer">
      <div class="stack">
        <p>{t('disclaimer.text')}</p>
        {data ? <p>{t('shell.footer.validFrom', { date: formatDate(data.validFrom, currentLocale.value) })}</p> : null}
        {isMissingCurrent ? <p class="notice warning">{t('shell.footer.missingCurrent', { year })}</p> : null}
        {isHistorical ? <p class="muted">{t('shell.footer.historical', { year })}</p> : null}
        <div>
          <p class="small">{t('shell.footer.sheets')}</p>
          <ul class="footer-links">
            {SHEET_LINKS.map((sheet) => (
              <li key={sheet.year}>
                <ExternalLink href={sheet.url}>{t('shell.footer.sheet', { year: sheet.year })}</ExternalLink>
              </li>
            ))}
          </ul>
        </div>
        <ul class="footer-links">
          <li>
            <ExternalLink href={ISSUES_URL}>{t('feedback.report')}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={REPOSITORY_URL}>{t('shell.footer.source')}</ExternalLink>
          </li>
        </ul>
      </div>
    </footer>
  )
}
