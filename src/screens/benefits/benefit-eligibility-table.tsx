import { MATERNITY_INSURED_DAYS_IN_TWO_YEARS, MATERNITY_OSVC_INSURED_DAYS_IN_LAST_YEAR } from '../../calc'
import { useT } from '../../app/context'
import type { Translator } from '../../i18n'
import type { eligibilityVerdictsFor } from './eligibility-verdicts'

type Verdicts = ReturnType<typeof eligibilityVerdictsFor>
type Verdict = { isEligible: boolean; unmetConditions: string[] }

/**
 * The plain-language reason for one missing condition. Unknown conditions fall back to the waiting period, the only
 * other condition the eligibility rules report.
 *
 * @param {object} params
 * @param {string} params.condition a condition name from benefit-eligibility.ts
 * @param {Translator} params.t
 */
const reasonFor = ({ condition, t }: { condition: string; t: Translator }): string => {
  if (condition === 'insuredDaysInLastTwoYears') {
    return t('benefits.eligibility.reason.insuredDays', { required: MATERNITY_INSURED_DAYS_IN_TWO_YEARS })
  }
  if (condition === 'osvcInsuredDaysInLastYear') {
    return t('benefits.eligibility.reason.osvcDays', { required: MATERNITY_OSVC_INSURED_DAYS_IN_LAST_YEAR })
  }
  return t('benefits.eligibility.reason.waitingPeriod')
}

/** One cell: yes or no, the optional note, and the reasons for a no. */
const VerdictCell = ({ verdict, note }: { verdict: Verdict; note?: string }) => {
  const t = useT()
  return (
    <>
      <strong>{verdict.isEligible ? t('benefits.eligibility.yes') : t('benefits.eligibility.no')}</strong>
      {note ? <p class="small muted">{note}</p> : null}
      {verdict.unmetConditions.length > 0 ? (
        <ul class="small">
          {verdict.unmetConditions.map((condition) => (
            <li key={condition}>{reasonFor({ condition, t })}</li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

/**
 * Who qualifies for sickness, maternity and paternity benefit, for an employee and for an OSVČ.
 *
 * @param {object} props
 * @param {Verdicts} props.verdicts the result of eligibilityVerdictsFor
 */
export const BenefitEligibilityTable = ({ verdicts }: { verdicts: Verdicts }) => {
  const t = useT()
  const rows = [
    {
      key: 'sickness',
      label: t('benefits.eligibility.sickness'),
      employee: verdicts.employee.sickness,
      osvc: verdicts.osvc.sickness,
      employeeNote: t('benefits.eligibility.noWaitingPeriod'),
    },
    {
      key: 'maternity',
      label: t('benefits.eligibility.maternity'),
      employee: verdicts.employee.maternity,
      osvc: verdicts.osvc.maternity,
      employeeNote: undefined,
    },
    {
      key: 'paternity',
      label: t('benefits.eligibility.paternity'),
      employee: verdicts.employee.paternity,
      osvc: verdicts.osvc.paternity,
      employeeNote: undefined,
    },
  ]

  return (
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">{t('benefits.eligibility.column.benefit')}</th>
            <th scope="col">{t('benefits.compare.column.employee')}</th>
            <th scope="col">{t('benefits.compare.column.osvc')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              <td>
                <VerdictCell verdict={row.employee} note={row.employeeNote} />
              </td>
              <td>
                <VerdictCell verdict={row.osvc} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
