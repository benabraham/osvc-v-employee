import { results, store, useT } from './context'
import { activeYear } from './shell-state'
import { valueLabelFor } from './value-labels'

/**
 * The tax-year select in the header, over the four years of the window, with the kind of each year. Next to it:
 * a badge when the year runs on the user's own values, and one when some values are not verified.
 */
export const YearSwitcher = () => {
  const t = useT()
  const unverifiedValues = results.value?.unverifiedValues ?? []
  const unverifiedTitle = t('shell.year.unverifiedTitle', {
    values: unverifiedValues.map((key) => valueLabelFor({ key, t })).join(', '),
  })
  return (
    <div class="year-switcher">
      <div class="field year-field">
        <label for="tax-year">{t('shell.year.label')}</label>
        <div class="field-control">
          <select
            id="tax-year"
            value={String(activeYear.value)}
            onChange={(event) => store.setActiveYear(Number((event.currentTarget as HTMLSelectElement).value))}
          >
            {store.yearWindow.value.map((info) => (
              <option key={info.year} value={String(info.year)}>
                {`${info.year} · ${t(`year.kind.${info.kind}`)}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      {store.isUsingCustomData.value ? <span class="badge accent">{t('badge.custom')}</span> : null}
      {unverifiedValues.length > 0 ? (
        <span class="badge warning" title={unverifiedTitle}>
          {t('badge.unverified')}
        </span>
      ) : null}
    </div>
  )
}
