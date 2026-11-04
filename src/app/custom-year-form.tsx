import { useState } from 'preact/hooks'
import { TAX_YEARS, customYearDataFor } from '../data/tax-years'
import { NumberField } from '../ui'
import { store, useT } from './context'
import { customYearDataFrom, draftFor, type CustomYearDraft } from './custom-year-data'

/**
 * The form for the user's own numbers for one year. It opens prefilled with the numbers already saved for the year,
 * or else with the latest official year. Saving stores them and turns them on for the year; results from them are
 * marked "vlastní hodnoty".
 *
 * @param {object} props
 * @param {number} props.year
 * @param {() => void} props.onDone called after saving, after switching to the official values, and on cancel
 */
export const CustomYearForm = ({ year, onDone }: { year: number; onDone: () => void }) => {
  const t = useT()
  const [base] = useState(() => store.state.peek().customYearData[String(year)] ?? customYearDataFor({ year }))
  const [draft, setDraft] = useState<CustomYearDraft>(() => draftFor({ data: base }))
  const hasOfficialData = TAX_YEARS[year] !== undefined
  const titleId = `custom-year-title-${year}`

  const setField = <K extends keyof CustomYearDraft>(field: K) => (value: number) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const onSubmit = (event: Event) => {
    event.preventDefault()
    store.setCustomYearData(year, customYearDataFrom({ base, draft }))
    store.setUseCustomData(year, true)
    onDone()
  }

  const useOfficialValues = () => {
    store.setUseCustomData(year, false)
    onDone()
  }

  return (
    <form class="card stack custom-year-form" aria-labelledby={titleId} onSubmit={onSubmit}>
      <h2 id={titleId}>{t('shell.custom.title', { year })}</h2>
      <p class="muted small">{t('shell.custom.intro')}</p>
      <div class="fields-grid">
        <NumberField
          id="custom-average-wage"
          label={t('shell.custom.averageWage')}
          value={draft.averageWage}
          onValue={setField('averageWage')}
          unit={t('unit.czk')}
          help={t('shell.custom.averageWageHelp')}
          min={1}
        />
        <NumberField
          id="custom-minimum-wage"
          label={t('shell.custom.minimumWage')}
          value={draft.minimumWage}
          onValue={setField('minimumWage')}
          unit={t('unit.czk')}
          min={1}
        />
        <NumberField
          id="custom-working-days"
          label={t('shell.custom.workingDays')}
          value={draft.workingDays}
          onValue={setField('workingDays')}
          unit={t('unit.days')}
          min={1}
          max={366}
        />
        <NumberField
          id="custom-pausalni-band-1"
          label={t('shell.custom.pausalniBand1')}
          value={draft.pausalniBand1}
          onValue={setField('pausalniBand1')}
          unit={t('shell.unit.czkPerMonth')}
          min={0}
        />
        <NumberField
          id="custom-pausalni-band-2"
          label={t('shell.custom.pausalniBand2')}
          value={draft.pausalniBand2}
          onValue={setField('pausalniBand2')}
          unit={t('shell.unit.czkPerMonth')}
          min={0}
        />
        <NumberField
          id="custom-social-minimum-share"
          label={t('shell.custom.socialMinimumShare')}
          value={draft.socialMinimumSharePercent}
          onValue={setField('socialMinimumSharePercent')}
          unit="%"
          min={0}
          max={100}
          maximumFractionDigits={2}
        />
        <NumberField
          id="custom-payer-credit"
          label={t('shell.custom.payerCredit')}
          value={draft.payerCredit}
          onValue={setField('payerCredit')}
          unit={t('shell.unit.czkPerYear')}
          min={0}
        />
        <NumberField
          id="custom-child-first"
          label={t('shell.custom.childFirst')}
          value={draft.childCreditFirst}
          onValue={setField('childCreditFirst')}
          unit={t('shell.unit.czkPerMonth')}
          min={0}
        />
        <NumberField
          id="custom-child-second"
          label={t('shell.custom.childSecond')}
          value={draft.childCreditSecond}
          onValue={setField('childCreditSecond')}
          unit={t('shell.unit.czkPerMonth')}
          min={0}
        />
        <NumberField
          id="custom-child-third"
          label={t('shell.custom.childThirdAndMore')}
          value={draft.childCreditThirdAndMore}
          onValue={setField('childCreditThirdAndMore')}
          unit={t('shell.unit.czkPerMonth')}
          min={0}
        />
      </div>
      <div class="row">
        <button type="submit" class="button">
          {t('shell.custom.save')}
        </button>
        <button type="button" class="button secondary" onClick={onDone}>
          {t('action.cancel')}
        </button>
        {hasOfficialData ? (
          <button type="button" class="button ghost" onClick={useOfficialValues}>
            {t('shell.custom.useOfficial')}
          </button>
        ) : null}
      </div>
    </form>
  )
}
