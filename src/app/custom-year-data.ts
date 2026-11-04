/**
 * The custom-year form as numbers, and the conversion between the form and the year data. Pure.
 */
import type { TaxYearData, ValueStatus } from '../data/tax-years'

/** The form's fields: money in Kč, the social share as typed (35 for 35 %). */
export type CustomYearDraft = {
  averageWage: number
  minimumWage: number
  workingDays: number
  pausalniBand1: number
  pausalniBand2: number
  socialMinimumSharePercent: number
  payerCredit: number
  childCreditFirst: number
  childCreditSecond: number
  childCreditThirdAndMore: number
}

/** The form fields, grouped by the value status they change, in the form's order. */
const STATUS_KEY_BY_FIELD: [keyof CustomYearDraft, string][] = [
  ['averageWage', 'averageWage'],
  ['minimumWage', 'minimumWage'],
  ['workingDays', 'workingDays'],
  ['pausalniBand1', 'pausalniDanMonthly'],
  ['pausalniBand2', 'pausalniDanMonthly'],
  ['socialMinimumSharePercent', 'socialMinimumShare'],
  ['payerCredit', 'incomeTax'],
  ['childCreditFirst', 'incomeTax'],
  ['childCreditSecond', 'incomeTax'],
  ['childCreditThirdAndMore', 'incomeTax'],
]

/**
 * Rounds away floating-point noise, so 0.35 × 100 shows as 35.
 *
 * @param {number} value
 * @returns {number}
 */
const cleanPercent = (value: number): number => Math.round(value * 1e6) / 1e6

/**
 * The form values of a year's data.
 *
 * @param {object} params
 * @param {TaxYearData} params.data
 * @returns {CustomYearDraft}
 */
export const draftFor = ({ data }: { data: TaxYearData }): CustomYearDraft => ({
  averageWage: data.averageWage,
  minimumWage: data.minimumWage,
  workingDays: data.workingDays,
  pausalniBand1: data.pausalniDanMonthly[0],
  pausalniBand2: data.pausalniDanMonthly[1],
  socialMinimumSharePercent: cleanPercent(data.socialMinimumShare * 100),
  payerCredit: data.incomeTax.payerCredit,
  childCreditFirst: data.incomeTax.childCreditsMonthly.first,
  childCreditSecond: data.incomeTax.childCreditsMonthly.second,
  childCreditThirdAndMore: data.incomeTax.childCreditsMonthly.thirdAndMore,
})

/**
 * The value statuses whose form fields differ between the base and the edited draft.
 *
 * @param {object} params
 * @param {CustomYearDraft} params.base the draft the form started from
 * @param {CustomYearDraft} params.draft the edited draft
 * @returns {string[]} unique status keys, in the form's order
 */
export const changedStatusKeysFor = ({ base, draft }: { base: CustomYearDraft; draft: CustomYearDraft }): string[] => {
  const changed = STATUS_KEY_BY_FIELD.filter(([field]) => base[field] !== draft[field]).map(([, statusKey]) => statusKey)
  return [...new Set(changed)]
}

/**
 * The year data for the edited form: the form values replace the base values, the edited groups are marked
 * 'custom', and everything the form does not show (bands 3, thresholds, sources) stays as in the base.
 *
 * @param {object} params
 * @param {TaxYearData} params.base the data the form was prefilled from
 * @param {CustomYearDraft} params.draft the edited form
 * @returns {TaxYearData}
 */
export const customYearDataFrom = ({ base, draft }: { base: TaxYearData; draft: CustomYearDraft }): TaxYearData => {
  const changedKeys = changedStatusKeysFor({ base: draftFor({ data: base }), draft })
  const editedStatus: Partial<Record<string, ValueStatus>> = Object.fromEntries(
    changedKeys.map((key) => [key, 'custom' as const]),
  )
  return {
    ...base,
    averageWage: draft.averageWage,
    minimumWage: draft.minimumWage,
    workingDays: draft.workingDays,
    socialMinimumShare: draft.socialMinimumSharePercent / 100,
    pausalniDanMonthly: [draft.pausalniBand1, draft.pausalniBand2, base.pausalniDanMonthly[2]],
    incomeTax: {
      ...base.incomeTax,
      payerCredit: draft.payerCredit,
      childCreditsMonthly: {
        first: draft.childCreditFirst,
        second: draft.childCreditSecond,
        thirdAndMore: draft.childCreditThirdAndMore,
      },
    },
    status: { ...base.status, ...editedStatus },
  }
}
