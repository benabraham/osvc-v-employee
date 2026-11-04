import { store, useT } from '../../app/context'
import type { TaxYearData } from '../../data/tax-years'
import type { Inputs } from '../../model'
import { NumberField } from '../../ui'
import { moneyText } from './calc-format'
import { withDeductions } from './calc-updates'

/**
 * Deductions from the tax base: gifts, blood and organ donations (valued by § 15 odst. 1), mortgage interest in
 * two groups, the months it was paid, and retirement products. Each one shows its cap.
 *
 * @param {object} props
 * @param {Inputs} props.inputs
 * @param {TaxYearData} props.data
 */
export const CalcDeductionFields = ({ inputs, data }: { inputs: Inputs; data: TaxYearData }) => {
  const t = useT()
  const { deductions } = inputs
  const { mortgageInterestCap, mortgageInterestPre2021Cap, retirementProductsCap } = data.incomeTax

  return (
    <div class="stack">
      <h3>{t('calc.deductions.heading')}</h3>
      <NumberField
        id="calc-donations"
        label={t('calc.deductions.donations')}
        value={deductions.donations}
        onValue={(donations) => store.updateInputs(withDeductions({ donations }))}
        unit={t('unit.czk')}
        help={t('calc.deductions.donationsHelp')}
        min={0}
      />
      <NumberField
        id="calc-blood-donations"
        label={t('calc.deductions.blood')}
        value={deductions.bloodDonations}
        onValue={(bloodDonations) => store.updateInputs(withDeductions({ bloodDonations }))}
        unit={t('calc.unit.count')}
        help={t('calc.deductions.bloodHelp')}
        min={0}
      />
      <NumberField
        id="calc-organ-donations"
        label={t('calc.deductions.organ')}
        value={deductions.organDonations}
        onValue={(organDonations) => store.updateInputs(withDeductions({ organDonations }))}
        unit={t('calc.unit.count')}
        help={t('calc.deductions.organHelp')}
        min={0}
      />
      <NumberField
        id="calc-mortgage-interest"
        label={t('calc.deductions.mortgage')}
        value={deductions.mortgageInterest}
        onValue={(mortgageInterest) => store.updateInputs(withDeductions({ mortgageInterest }))}
        unit={t('unit.czk')}
        help={t('calc.deductions.mortgageHelp', { cap: moneyText(mortgageInterestCap) })}
        min={0}
      />
      <NumberField
        id="calc-mortgage-interest-pre-2021"
        label={t('calc.deductions.mortgagePre2021')}
        value={deductions.mortgageInterestPre2021}
        onValue={(mortgageInterestPre2021) => store.updateInputs(withDeductions({ mortgageInterestPre2021 }))}
        unit={t('unit.czk')}
        help={t('calc.deductions.mortgagePre2021Help', { cap: moneyText(mortgageInterestPre2021Cap) })}
        min={0}
      />
      <NumberField
        id="calc-mortgage-months"
        label={t('calc.deductions.mortgageMonths')}
        value={deductions.mortgageMonths}
        onValue={(mortgageMonths) => store.updateInputs(withDeductions({ mortgageMonths }))}
        unit={t('unit.months')}
        help={t('calc.deductions.mortgageMonthsHelp')}
        min={0}
        max={12}
      />
      <NumberField
        id="calc-retirement-products"
        label={t('calc.deductions.retirement')}
        value={deductions.retirementProducts}
        onValue={(retirementProducts) => store.updateInputs(withDeductions({ retirementProducts }))}
        unit={t('unit.czk')}
        help={t('calc.deductions.retirementHelp', { cap: moneyText(retirementProductsCap) })}
        min={0}
      />
    </div>
  )
}
