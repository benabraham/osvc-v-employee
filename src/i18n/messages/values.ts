import type { MessageBundle } from '../types'

/**
 * Human labels of the year values (keys of TaxYearData), used by the header badge and the About screen.
 * They keep the about.value.* keys and ship in the initial bundle.
 */
export const valuesMessages: MessageBundle = {
  cs: {
    'about.value.workingDays': 'Pracovní dny',
    'about.value.generalAssessmentBase': 'Všeobecný vyměřovací základ',
    'about.value.conversionCoefficient': 'Přepočítací koeficient',
    'about.value.averageWage': 'Průměrná mzda',
    'about.value.minimumWage': 'Minimální mzda',
    'about.value.socialMinimumShare': 'Podíl průměrné mzdy pro minimální základ SP',
    'about.value.newOsvcSocialMinimumShare': 'Minimální základ SP pro nového OSVČ',
    'about.value.socialProfitShare': 'Podíl zisku pro sociální pojištění',
    'about.value.pausalniDanMonthly': 'Paušální daň, pásma',
    'about.value.salesRegistrationSurcharge': 'Paušální daň, příplatek bez registrace tržeb',
    'about.value.sicknessEligibilityThreshold': 'Rozhodný příjem pro nemocenské pojištění',
    'about.value.sicknessInsuranceRatePercent': 'Sazba nemocenského pojištění OSVČ',
    'about.value.reductionThresholds': 'Redukční hranice dávek',
    'about.value.incomeTax': 'Daň z příjmů a slevy',
    'about.value.employee': 'Sazby pojistného zaměstnance',
  },
  en: {
    'about.value.workingDays': 'Working days',
    'about.value.generalAssessmentBase': 'General assessment base',
    'about.value.conversionCoefficient': 'Conversion coefficient',
    'about.value.averageWage': 'Average wage',
    'about.value.minimumWage': 'Minimum wage',
    'about.value.socialMinimumShare': 'Share of the average wage for the minimum social base',
    'about.value.newOsvcSocialMinimumShare': 'Minimum social base for a new self-employed person',
    'about.value.socialProfitShare': 'Share of profit for social insurance',
    'about.value.pausalniDanMonthly': 'Flat-rate tax, bands',
    'about.value.salesRegistrationSurcharge': 'Flat-rate tax, surcharge without sales registration',
    'about.value.sicknessEligibilityThreshold': 'Eligibility threshold for sickness insurance',
    'about.value.sicknessInsuranceRatePercent': 'Self-employed sickness insurance rate',
    'about.value.reductionThresholds': 'Benefit reduction thresholds',
    'about.value.incomeTax': 'Income tax and credits',
    'about.value.employee': 'Employee insurance rates',
  },
}
