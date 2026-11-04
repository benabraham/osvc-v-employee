import { store, useT } from '../../app/context'
import type { TaxYearData } from '../../data/tax-years'
import type { Inputs, Results } from '../../model'
import { NumberField, ResultRow } from '../../ui'
import { moneyText, numberText } from './calc-format'

/**
 * Invoicing inputs: working days (with the year's default), holiday, hours, non-billable hours and the hourly rate,
 * with the derived days, billable hours and invoiced amount.
 *
 * @param {object} props
 * @param {Inputs} props.inputs
 * @param {TaxYearData} props.data
 * @param {Results} props.results
 */
export const CalcBillingCard = ({ inputs, data, results }: { inputs: Inputs; data: TaxYearData; results: Results }) => {
  const t = useT()
  const isWorkingDaysDefault = inputs.workingDays === null
  const workingDaysDefaultNote = t('calc.billing.workingDaysDefault', { year: data.year, days: numberText(data.workingDays) })

  return (
    <section class="card" aria-labelledby="calc-billing-heading">
      <h2 id="calc-billing-heading">{t('calc.billing.heading')}</h2>
      <div class="fields-grid">
        <NumberField
          id="calc-working-days"
          label={t('calc.billing.workingDays')}
          value={results.workingDays}
          onValue={(days) => store.setInput('workingDays', days)}
          unit={t('unit.days')}
          help={t('calc.billing.workingDaysHelp')}
          min={0}
          max={366}
          after={
            <div class="calc-field-note">
              <span class="small muted">{workingDaysDefaultNote}</span>
              {isWorkingDaysDefault ? null : (
                <button type="button" class="button ghost small" onClick={() => store.setInput('workingDays', null)}>
                  {t('calc.billing.workingDaysReset')}
                </button>
              )}
            </div>
          }
        />
        <NumberField
          id="calc-vacation-days"
          label={t('calc.billing.vacationDays')}
          value={inputs.vacationDays}
          onValue={(days) => store.setInput('vacationDays', days)}
          unit={t('unit.days')}
          help={t('calc.billing.vacationHelp')}
          min={0}
          max={366}
        />
        <NumberField
          id="calc-hours-per-day"
          label={t('calc.billing.hoursPerDay')}
          value={inputs.hoursPerDay}
          onValue={(hours) => store.setInput('hoursPerDay', hours)}
          unit={t('unit.hours')}
          help={t('calc.billing.hoursPerDayHelp')}
          maximumFractionDigits={1}
          min={0}
          max={24}
        />
        <NumberField
          id="calc-non-billable-hours"
          label={t('calc.billing.nonBillableHours')}
          value={inputs.nonBillableHoursPerYear}
          onValue={(hours) => store.setInput('nonBillableHoursPerYear', hours)}
          unit={t('unit.hours')}
          help={t('calc.billing.nonBillableHoursHelp')}
          min={0}
        />
        <NumberField
          id="calc-hourly-rate"
          label={t('calc.billing.hourlyRate')}
          value={inputs.hourlyRate}
          onValue={(rate) => store.setInput('hourlyRate', rate)}
          unit={t('unit.czkPerHour')}
          min={0}
        />
      </div>
      <dl class="result-list">
        <ResultRow label={t('calc.billing.daysAvailable')}>
          {numberText(results.workingDays - inputs.vacationDays)} {t('unit.days')}
        </ResultRow>
        <ResultRow label={t('calc.billing.billableHours')}>
          {numberText(results.plan.billableHours)} {t('unit.hours')}
        </ResultRow>
        <ResultRow label={t('calc.billing.invoicedPerYear')}>{moneyText(results.plan.invoiced)}</ResultRow>
      </dl>
    </section>
  )
}
