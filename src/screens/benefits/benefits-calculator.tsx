import { useState } from 'preact/hooks'
import { useT } from '../../app/context'
import type { Results } from '../../model'
import { MATERNITY_INSURED_DAYS_IN_TWO_YEARS, MATERNITY_OSVC_INSURED_DAYS_IN_LAST_YEAR } from '../../calc'
import { Disclosure, NumberField, Toggle } from '../../ui'
import { BenefitComparisonTable } from './benefit-comparison-table'
import { BenefitEligibilityTable } from './benefit-eligibility-table'
import {
  compareBenefits,
  HOURS_PER_WORKING_DAY,
  MATERNITY_WEEKS_MULTIPLE_BIRTH,
  MATERNITY_WEEKS_SINGLE_BIRTH,
  osvcPremiumForBenefits,
} from './compare-benefits'
import { eligibilityVerdictsFor } from './eligibility-verdicts'

/** Insured days in the two years before the benefit: a worker who was insured throughout has about this many. */
const DEFAULT_INSURED_DAYS_IN_TWO_YEARS = 730

/**
 * The inputs (prefilled from the calculation, kept only on this screen), the side-by-side amounts and the
 * eligibility. Mounted only when the active year has data, so the prefilled values are read once.
 *
 * @param {object} props
 * @param {Results} props.results the calculation of the active year
 */
export const BenefitsCalculator = ({ results }: { results: Results }) => {
  const t = useT()
  const isInsuranceOn = results.sicknessInsurance.enabled
  const calculatedPremium = osvcPremiumForBenefits({
    isEnabled: isInsuranceOn,
    sicknessInsurance: results.sicknessInsurance,
    rates: results.rates.sicknessInsurance,
  })

  const [employeeMonthlyGross, setEmployeeMonthlyGross] = useState(results.grossEquivalent.grossWage)
  const [osvcMonthlySicknessPremium, setOsvcMonthlySicknessPremium] = useState(calculatedPremium.monthlyPremium)
  const [sicknessDays, setSicknessDays] = useState(30)
  const [isMultipleBirth, setIsMultipleBirth] = useState(false)
  const [insuredDaysInLastTwoYears, setInsuredDaysInLastTwoYears] = useState(DEFAULT_INSURED_DAYS_IN_TWO_YEARS)
  const [osvcInsuredDaysInLastYear, setOsvcInsuredDaysInLastYear] = useState(isInsuranceOn ? 365 : 0)
  const [osvcInsuredMonths, setOsvcInsuredMonths] = useState(isInsuranceOn ? 12 : 0)
  const [continuesFromInsuredJob, setContinuesFromInsuredJob] = useState(false)

  const maternityWeeks = isMultipleBirth ? MATERNITY_WEEKS_MULTIPLE_BIRTH : MATERNITY_WEEKS_SINGLE_BIRTH
  const comparison = compareBenefits({
    employeeMonthlyGross,
    osvcMonthlySicknessPremium,
    sicknessDays,
    maternityWeeks,
    workingHoursPerYear: results.workingDays * HOURS_PER_WORKING_DAY,
    rates: results.rates.benefits,
  })
  const verdicts = eligibilityVerdictsFor({
    answers: {
      insuredDaysInLastTwoYears,
      osvcInsuredDaysInLastYear,
      osvcInsuredMonths,
      continuesFromInsuredJob,
    },
  })

  return (
    <div class="split-layout">
      <section class="card stack" aria-labelledby="benefit-inputs-heading">
        <h2 id="benefit-inputs-heading">{t('benefits.inputs.heading')}</h2>
        <p class="muted small">{t('benefits.inputs.help')}</p>
        <NumberField
          id="benefit-employee-gross"
          label={t('benefits.inputs.employeeGross')}
          unit={t('unit.czk')}
          value={employeeMonthlyGross}
          onValue={setEmployeeMonthlyGross}
          min={0}
          help={t('benefits.inputs.employeeGrossHelp')}
        />
        <NumberField
          id="benefit-premium"
          label={t('benefits.inputs.premium')}
          unit={t('unit.czk')}
          value={osvcMonthlySicknessPremium}
          onValue={setOsvcMonthlySicknessPremium}
          min={0}
          help={isInsuranceOn ? undefined : t('benefits.inputs.premiumHelp')}
        />
        <NumberField
          id="benefit-sickness-days"
          label={t('benefits.inputs.sicknessDays')}
          unit={t('unit.days')}
          value={sicknessDays}
          onValue={setSicknessDays}
          min={0}
          max={365}
          help={t('benefits.inputs.sicknessDaysHelp')}
        />
        <Toggle
          id="benefit-multiple-birth"
          label={t('benefits.inputs.multipleBirth')}
          checked={isMultipleBirth}
          onChange={setIsMultipleBirth}
          help={t('benefits.inputs.multipleBirthHelp')}
        />
        <NumberField
          id="benefit-insured-days"
          label={t('benefits.inputs.insuredDays')}
          unit={t('unit.days')}
          value={insuredDaysInLastTwoYears}
          onValue={setInsuredDaysInLastTwoYears}
          min={0}
          max={731}
          help={t('benefits.inputs.insuredDaysHelp', { required: MATERNITY_INSURED_DAYS_IN_TWO_YEARS })}
        />
        <NumberField
          id="benefit-osvc-days"
          label={t('benefits.inputs.osvcDaysLastYear')}
          unit={t('unit.days')}
          value={osvcInsuredDaysInLastYear}
          onValue={setOsvcInsuredDaysInLastYear}
          min={0}
          max={366}
          help={t('benefits.inputs.osvcDaysLastYearHelp', { required: MATERNITY_OSVC_INSURED_DAYS_IN_LAST_YEAR })}
        />
        <NumberField
          id="benefit-osvc-months"
          label={t('benefits.inputs.osvcMonths')}
          unit={t('unit.months')}
          value={osvcInsuredMonths}
          onValue={setOsvcInsuredMonths}
          min={0}
          max={120}
          help={t('benefits.inputs.osvcMonthsHelp')}
        />
        <Toggle
          id="benefit-from-job"
          label={t('benefits.inputs.fromJob')}
          checked={continuesFromInsuredJob}
          onChange={setContinuesFromInsuredJob}
        />
      </section>

      <div class="stack">
        <section class="card" aria-labelledby="benefit-compare-heading">
          <h2 id="benefit-compare-heading">{t('benefits.compare.heading')}</h2>
          <p class="muted small">{t('benefits.compare.caption')}</p>
          <BenefitComparisonTable comparison={comparison} maternityWeeks={maternityWeeks} />
          <p class="small muted">{t('benefits.compare.osvcNoPay')}</p>
          <Disclosure summary={t('benefits.assumptions.heading')}>
            <p>{t('benefits.assumptions.compensation')}</p>
            <p>{t('benefits.assumptions.sickness')}</p>
            <p>{t('benefits.assumptions.osvc')}</p>
            <p>{t('benefits.assumptions.maternity')}</p>
          </Disclosure>
        </section>

        <section class="card" aria-labelledby="benefit-eligibility-heading">
          <h2 id="benefit-eligibility-heading">{t('benefits.eligibility.heading')}</h2>
          <p class="muted small">{t('benefits.eligibility.intro')}</p>
          <BenefitEligibilityTable verdicts={verdicts} />
          <p class="small muted">{t('benefits.eligibility.osvcNote')}</p>
        </section>
      </div>
    </div>
  )
}
