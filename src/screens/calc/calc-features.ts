import type { TaxYearData } from '../../data/tax-years'

/** The inputs a tax year offers, as its law defines them. */
export type CalcFeatures = {
  /** 2027+: the band 1 surcharge instead of registering sales (§ 2b zákona 586/1992 Sb.) */
  hasSalesRegistrationSurcharge: boolean
  /** 2027+: student credit, one twelfth per month (§ 35ba odst. 3) */
  hasStudentCredit: boolean
  /** 2027+: sales registration credit (§ 35be) */
  hasSalesRegistrationCredit: boolean
  /** 2027+: školkovné per child up to the minimum wage (§ 35bd) */
  hasPreschoolFees: boolean
}

/**
 * Which optional credits and surcharges a year's data defines. A year without the field has no such credit,
 * so the screen does not offer it.
 *
 * @param {object} params
 * @param {TaxYearData} params.data the year's official or custom data
 * @returns {CalcFeatures}
 */
export const calcFeaturesFor = ({ data }: { data: TaxYearData }): CalcFeatures => ({
  hasSalesRegistrationSurcharge: data.salesRegistrationSurcharge !== undefined,
  hasStudentCredit: data.incomeTax.studentCredit !== undefined,
  hasSalesRegistrationCredit: data.incomeTax.salesRegistrationCredit !== undefined,
  hasPreschoolFees: data.incomeTax.childPlacementCreditCapIsMinimumWage !== undefined,
})
