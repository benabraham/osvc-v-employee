/**
 * Human names of the year-data values, for the badges and the sources list. The keys are the `TaxYearData` fields
 * (and the `status` keys) and the messages are in the About bundle.
 */
import type { Translator } from '../i18n'

const VALUE_LABEL_KEYS: Record<string, string> = {
  workingDays: 'about.value.workingDays',
  generalAssessmentBase: 'about.value.generalAssessmentBase',
  conversionCoefficient: 'about.value.conversionCoefficient',
  averageWage: 'about.value.averageWage',
  minimumWage: 'about.value.minimumWage',
  socialMinimumShare: 'about.value.socialMinimumShare',
  newOsvcSocialMinimumShare: 'about.value.newOsvcSocialMinimumShare',
  socialProfitShare: 'about.value.socialProfitShare',
  pausalniDanMonthly: 'about.value.pausalniDanMonthly',
  salesRegistrationSurcharge: 'about.value.salesRegistrationSurcharge',
  sicknessEligibilityThreshold: 'about.value.sicknessEligibilityThreshold',
  sicknessInsuranceRatePercent: 'about.value.sicknessInsuranceRatePercent',
  reductionThresholds: 'about.value.reductionThresholds',
  incomeTax: 'about.value.incomeTax',
  employee: 'about.value.employee',
}

/**
 * The message key of a value's name, or undefined for a key without one.
 *
 * @param {string} key a value key such as 'averageWage'
 * @returns {string | undefined}
 */
export const valueLabelKeyFor = (key: string): string | undefined =>
  Object.hasOwn(VALUE_LABEL_KEYS, key) ? VALUE_LABEL_KEYS[key] : undefined

/**
 * The name of a value in the current language; the key itself when it has no name.
 *
 * @param {object} params
 * @param {string} params.key
 * @param {Translator} params.t
 * @returns {string}
 */
export const valueLabelFor = ({ key, t }: { key: string; t: Translator }): string => {
  const labelKey = valueLabelKeyFor(key)
  return labelKey === undefined ? key : t(labelKey)
}
