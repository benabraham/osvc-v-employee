import { store, useT } from '../../app/context'
import { ExternalLink } from '../../app/external-link'
import { ISSUES_URL, REPOSITORY_URL, SHEET_LINKS } from '../../app/footer'
import { activeYear } from '../../app/shell-state'
import { valueLabelFor } from '../../app/value-labels'
import type { TaxYearData, ValueStatus } from '../../data/tax-years'

/** The original video by the author. */
export const VIDEO_URL = 'https://www.youtube.com/watch?v=iJGjTFDYw9A'

/** The status legend, in the order it is read: verified first. */
const STATUSES: readonly ValueStatus[] = ['verified', 'researched', 'custom']

/** The badge style of each status. */
const BADGE_CLASS_BY_STATUS: Record<ValueStatus, string> = {
  verified: 'badge accent',
  researched: 'badge warning',
  custom: 'badge',
}

/** The calculation in eight short steps, from the hours to the gross equivalent. */
const HOW_STEP_COUNT = 8

/**
 * The sources of the year's values, grouped by value, each with its status.
 *
 * @param {object} props
 * @param {TaxYearData} props.data the year's data
 */
const SourceGroups = ({ data }: { data: TaxYearData }) => {
  const t = useT()
  const keys = Object.keys(data.sources).filter((key) => (data.sources[key]?.length ?? 0) > 0)
  return (
    <div class="stack">
      {keys.map((key) => {
        const status: ValueStatus = data.status[key] ?? 'verified'
        return (
          <section key={key} class="source-group">
            <h3 class="row">
              <span>{valueLabelFor({ key, t })}</span>
              <span class={BADGE_CLASS_BY_STATUS[status]}>{t(`about.status.${status}`)}</span>
            </h3>
            <ul>
              {(data.sources[key] ?? []).map((source) => (
                <li key={source.url}>
                  <ExternalLink href={source.url}>{source.label}</ExternalLink>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

/**
 * The About screen: what the app answers, how the calculation works, privacy, the disclaimer, the sources of the
 * active year's values with their status, the licence, how to report problems, and the author.
 */
export const AboutScreen = () => {
  const t = useT()
  const year = activeYear.value
  const data = store.activeYearData.value
  const isUsingCustomData = store.isUsingCustomData.value
  const howSteps = Array.from({ length: HOW_STEP_COUNT }, (_, index) => `about.how.${index + 1}`)

  return (
    <section class="stack about-screen">
      <h1>{t('nav.about')}</h1>

      <section class="card">
        <h2>{t('about.questions.title')}</h2>
        <ul>
          <li>{t('about.questions.salary')}</li>
          <li>{t('about.questions.split')}</li>
        </ul>
      </section>

      <section class="card">
        <h2>{t('about.how.title')}</h2>
        <ol class="stack">
          {howSteps.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
      </section>

      <section class="card">
        <h2>{t('about.privacy.title')}</h2>
        <p>{t('about.privacy.text')}</p>
      </section>

      <section class="notice">
        <p>{t('disclaimer.text')}</p>
      </section>

      <section class="card stack">
        <h2>{t('about.sources.title', { year })}</h2>
        {data === undefined ? <p class="muted">{t('about.sources.none')}</p> : null}
        {data !== undefined && isUsingCustomData ? <p class="muted">{t('about.sources.custom')}</p> : null}
        {data === undefined ? null : <SourceGroups data={data} />}
        <section class="stack">
          <h3>{t('about.legend.title')}</h3>
          <dl class="stack">
            {STATUSES.map((status) => (
              <div key={status} class="row">
                <dt>
                  <span class={BADGE_CLASS_BY_STATUS[status]}>{t(`about.status.${status}`)}</span>
                </dt>
                <dd class="muted">{t(`about.status.${status}Text`)}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <section class="card">
        <h2>{t('about.licence.title')}</h2>
        <p>{t('about.licence.text')}</p>
        <ExternalLink href={REPOSITORY_URL}>{t('shell.footer.source')}</ExternalLink>
      </section>

      <section class="card">
        <h2>{t('about.issues.title')}</h2>
        <p>{t('about.issues.text')}</p>
        <ExternalLink href={ISSUES_URL}>{t('feedback.report')}</ExternalLink>
      </section>

      <section class="card">
        <h2>{t('about.author.title')}</h2>
        <p>{t('about.author.text')}</p>
        <ul class="footer-links">
          <li>
            <ExternalLink href={VIDEO_URL}>{t('about.author.video')}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={SHEET_LINKS[SHEET_LINKS.length - 1]!.url}>{t('about.author.sheet')}</ExternalLink>
          </li>
        </ul>
      </section>
    </section>
  )
}
