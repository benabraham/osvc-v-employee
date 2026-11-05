/**
 * Yearly tax constants: one data set per tax year, so a new year is a data change, not a code change.
 * Every value names its official source and a status (PRD "Value verification"). The detailed research,
 * with statute quotes, is in docs/legal-research/year-values.md.
 */
import type { EmployeeNetWageRates } from '../calc/employee-net-wage'
import type { OsvcIncomeTaxRates } from '../calc/osvc-income-tax'
import type { OsvcPlanRates } from '../calc/osvc-plan'
import { calculateOsvcMinimums } from '../calc/osvc-regimes'
import type { ReductionThresholds } from '../calc/benefits'

/** researched: from the law or one source; verified: two sources agree; custom: entered by the user */
export type ValueStatus = 'researched' | 'verified' | 'custom'
export type Source = { label: string; url: string }

/** Income tax rates without the values derived from the average wage or the minimum wage. */
export type YearIncomeTaxRates = Omit<OsvcIncomeTaxRates, 'solidarityThreshold' | 'minimumWage'>

export type YearEmployeeRates = {
  healthRate: number
  socialRate: number
  /** separate employee sickness rate (2024 only: 0.6 % next to 6.5 %) */
  sicknessRate?: number
  /** working pensioner rate (2026+) */
  socialRateRetired?: number
  employerSocialRate: number
}

export type TaxYearData = {
  year: number
  /** first day the values apply to; one set per year, a mid-year change applies to the whole year */
  validFrom: string
  workingDays: number
  /** všeobecný vyměřovací základ from two years earlier and its přepočítací koeficient (nařízení vlády) */
  generalAssessmentBase: number
  conversionCoefficient: number
  /** průměrná mzda: the product above rounded up */
  averageWage: number
  minimumWage: number
  /** share of the average wage for the minimum monthly SP base (§ 14 odst. 5 zákona 589/1992 Sb.) */
  socialMinimumShare: number
  newOsvcSocialMinimumShare: number
  /** share of profit that is the SP assessment base (§ 5b zákona 589/1992 Sb.) */
  socialProfitShare: number
  /** paušální daň bands 1, 2, 3 in Kč a month */
  pausalniDanMonthly: [number, number, number]
  /** band 1 surcharge instead of registering sales (2027+, § 2b zákona 586/1992 Sb.) */
  salesRegistrationSurcharge?: number
  /** rozhodný příjem for employee sickness insurance; twice it is the OSVČ minimum sickness base */
  sicknessEligibilityThreshold: number
  /** OSVČ voluntary sickness insurance rate in percent */
  sicknessInsuranceRatePercent: number
  /** redukční hranice for sickness, maternity and paternity benefits (§ 22 zákona 187/2006 Sb.) */
  reductionThresholds: ReductionThresholds
  incomeTax: YearIncomeTaxRates
  employee: YearEmployeeRates
  /** status per value; values not listed are 'verified' */
  status: Partial<Record<keyof TaxYearData | string, ValueStatus>>
  sources: Partial<Record<keyof TaxYearData | string, Source[]>>
}

const LAW = {
  incomeTax: { label: 'zákon 586/1992 Sb., o daních z příjmů', url: 'https://www.zakonyprolidi.cz/cs/1992-586' },
  social: { label: 'zákon 589/1992 Sb., o pojistném na sociální zabezpečení', url: 'https://www.zakonyprolidi.cz/cs/1992-589' },
  health: { label: 'zákon 592/1992 Sb., o pojistném na veřejné zdravotní pojištění', url: 'https://www.zakonyprolidi.cz/cs/1992-592' },
  sickness: { label: 'zákon 187/2006 Sb., o nemocenském pojištění', url: 'https://www.zakonyprolidi.cz/cs/2006-187' },
  minimumWageMpsv: { label: 'MPSV: vývoj minimální mzdy', url: 'https://mpsv.gov.cz/prehled-o-vyvoji-castek-minimalni-mzdy' },
  vzpAverageWage: { label: 'VZP: průměrná mzda', url: 'https://www.vzp.cz/platci/informace/osvc/osvc-prumerna-mzda' },
  pausalniDan2025: {
    label: 'Finanční správa: paušální daň 2025–2026',
    url: 'https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan/informace-k-institutu-pausalni-dane-pro-rok-2025',
  },
} as const

/** Second official sources for the two-source check (docs/legal-research/year-values.md, "Two-source check"). */
const SOURCE = {
  minimumWage2024: { label: 'nařízení vlády 396/2023 Sb. (minimální mzda 2024)', url: 'https://www.zakonyprolidi.cz/cs/2023-396' },
  minimumWage2025: { label: 'sdělení MPSV 286/2024 Sb. (minimální mzda 2025)', url: 'https://www.zakonyprolidi.cz/cs/2024-286' },
  minimumWage2026: { label: 'sdělení MPSV 356/2025 Sb. (minimální mzda 2026)', url: 'https://www.zakonyprolidi.cz/cs/2025-356' },
  minimumWage2027: { label: 'sdělení MPSV 171/2026 Sb. (minimální mzda 2027)', url: 'https://www.zakonyprolidi.cz/cs/2026-171' },
  coefficient2025And2026: { label: 'nařízení vlády 285/2024 Sb. (koeficient pro roky 2025 a 2026)', url: 'https://www.zakonyprolidi.cz/cs/2024-285' },
  coefficient2027: { label: 'nařízení vlády 164/2026 Sb. (koeficient pro roky 2027 a 2028)', url: 'https://www.zakonyprolidi.cz/cs/2026-164' },
  mpsvMinimumWage2026: {
    label: 'MPSV: minimální mzda od ledna 2026',
    url: 'https://mpsv.gov.cz/minimalni-mzda-od-ledna-2026-vzroste-o-1-600-korun-na-22-400-korun-mesicne',
  },
  cssz2024: {
    label: 'ČSSZ: přehled údajů pro sociální zabezpečení 2024',
    url: 'https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-pro-rok-2024',
  },
  cssz2025: {
    label: 'ČSSZ: přehled údajů pro sociální zabezpečení 2025',
    url: 'https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2025',
  },
  cssz2026: {
    label: 'ČSSZ: přehled údajů pro sociální zabezpečení 2026',
    url: 'https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026',
  },
  csszRates: { label: 'ČSSZ: sazby pojistného', url: 'https://www.cssz.gov.cz/vyse-a-sazba' },
  mpsvSocialInsurance2026: { label: 'MPSV: sociální pojištění v roce 2026', url: 'https://mpsv.gov.cz/socialni-pojisteni' },
  vzpEmployeeSplit: {
    label: 'VZP: platce pojistného, 4,5 % zaměstnanec a 9 % zaměstnavatel',
    url: 'https://www.vzp.cz/platci/informace/povinnosti-platcu-metodika/2-4-platce-pojistneho-zamestnavatel',
  },
  fsGeneralInfo2024: {
    label: 'Finanční správa: obecné informace 2024',
    url: 'https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace/archiv-obecne-informace-2024',
  },
  fsGeneralInfo2026: {
    label: 'Finanční správa: obecné informace 2026',
    url: 'https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace',
  },
  fsQa2024And2025: {
    label: 'Finanční správa: dotazy a odpovědi, zdaňovací období 2024 a 2025',
    url: 'https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/dotazy-a-odpovedi/2025/aktualni-dotazy-a-odpovedi-dzp-2024-a-2025',
  },
  fsQa2025And2026: {
    label: 'Finanční správa: dotazy a odpovědi, zdaňovací období 2025 a 2026',
    url: 'https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/dotazy-a-odpovedi/2026/aktualni-dotazy-a-odpovedi-k-dani-z',
  },
  fsPausalni2024: {
    label: 'Finanční správa: paušální daň 2024 (tisková zpráva)',
    url: 'https://financnisprava.gov.cz/cs/financni-sprava/media-a-verejnost/tiskove-zpravy-gfr/tiskove-zpravy-2024/pausalni-dan-prilakala-na-32-tisic-osvc',
  },
} as const

const COMMON_INCOME_TAX: YearIncomeTaxRates = {
  baseTaxRate: 0.15,
  solidarityTaxRate: 0.23,
  payerCredit: 30_840,
  spouseCredit: 24_840,
  disabilityDegree1or2Credit: 2_520,
  disabilityDegree3Credit: 5_040,
  ztpHolderCredit: 16_140,
  childCreditsMonthly: { first: 1_267, second: 1_860, thirdAndMore: 2_320 },
  mortgageInterestCap: 150_000,
  mortgageInterestPre2021Cap: 300_000,
  retirementProductsCap: 48_000,
  donationsMinimumShare: 0.02,
  donationsMinimumAmount: 1_000,
  donationsMaximumShare: 0.15,
  minimumChildBonus: 100,
}

const EMPLOYEE_FROM_2025: YearEmployeeRates = { healthRate: 0.045, socialRate: 0.071, employerSocialRate: 0.248 }

/** Official data for each tax year, keyed by the real tax year. */
export const TAX_YEARS: Record<number, TaxYearData> = {
  2024: {
    year: 2024,
    validFrom: '2024-01-01',
    workingDays: 252,
    generalAssessmentBase: 40_638,
    conversionCoefficient: 1.0819,
    averageWage: 43_967,
    minimumWage: 18_900,
    socialMinimumShare: 0.3,
    newOsvcSocialMinimumShare: 0.25,
    socialProfitShare: 0.55,
    pausalniDanMonthly: [7_498, 16_745, 27_139],
    sicknessEligibilityThreshold: 4_000,
    sicknessInsuranceRatePercent: 2.7,
    reductionThresholds: [1_466, 2_199, 4_397],
    incomeTax: COMMON_INCOME_TAX,
    employee: { healthRate: 0.045, socialRate: 0.065, sicknessRate: 0.006, employerSocialRate: 0.248 },
    status: { minimumWage: 'verified', averageWage: 'verified', pausalniDanMonthly: 'verified', incomeTax: 'researched', employee: 'researched' },
    sources: {
      averageWage: [{ label: 'nařízení vlády 286/2023 Sb.', url: 'https://www.zakonyprolidi.cz/cs/2023-286' }, LAW.vzpAverageWage, SOURCE.cssz2024],
      minimumWage: [SOURCE.minimumWage2024, LAW.minimumWageMpsv],
      pausalniDanMonthly: [SOURCE.fsPausalni2024, LAW.incomeTax, LAW.social, LAW.health],
      socialMinimumShare: [LAW.social, { label: 'ČSSZ: minimální vyměřovací základy', url: 'https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc' }],
      incomeTax: [LAW.incomeTax, SOURCE.fsGeneralInfo2024],
      employee: [LAW.social, SOURCE.cssz2024, LAW.health, SOURCE.vzpEmployeeSplit],
    },
  },
  2025: {
    year: 2025,
    validFrom: '2025-01-01',
    workingDays: 251,
    generalAssessmentBase: 43_682,
    conversionCoefficient: 1.0658,
    averageWage: 46_557,
    minimumWage: 20_800,
    socialMinimumShare: 0.35,
    newOsvcSocialMinimumShare: 0.25,
    socialProfitShare: 0.55,
    pausalniDanMonthly: [8_716, 16_745, 27_139],
    sicknessEligibilityThreshold: 4_500,
    sicknessInsuranceRatePercent: 2.7,
    reductionThresholds: [1_552, 2_328, 4_656],
    incomeTax: COMMON_INCOME_TAX,
    employee: EMPLOYEE_FROM_2025,
    status: { minimumWage: 'verified', averageWage: 'verified', pausalniDanMonthly: 'verified', incomeTax: 'researched', employee: 'researched' },
    sources: {
      averageWage: [{ label: 'nařízení vlády 282/2024 Sb.', url: 'https://www.zakonyprolidi.cz/cs/2024-282' }, LAW.vzpAverageWage, SOURCE.cssz2025],
      minimumWage: [SOURCE.minimumWage2025, SOURCE.coefficient2025And2026, LAW.minimumWageMpsv],
      pausalniDanMonthly: [LAW.pausalniDan2025, LAW.incomeTax, LAW.social, LAW.health],
      socialMinimumShare: [LAW.social, { label: 'ČSSZ: minimální vyměřovací základy', url: 'https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc' }],
      incomeTax: [LAW.incomeTax, SOURCE.fsQa2024And2025],
      employee: [LAW.social, LAW.health, SOURCE.vzpEmployeeSplit],
    },
  },
  2026: {
    year: 2026,
    validFrom: '2026-01-01',
    workingDays: 250,
    generalAssessmentBase: 46_278,
    conversionCoefficient: 1.0581,
    averageWage: 48_967,
    minimumWage: 22_400,
    // zákon 90/2026 Sb. cut the share from 40 % to 35 % from July, retroactively for the whole year
    socialMinimumShare: 0.35,
    newOsvcSocialMinimumShare: 0.25,
    socialProfitShare: 0.55,
    pausalniDanMonthly: [9_162, 16_745, 27_139],
    sicknessEligibilityThreshold: 4_500,
    sicknessInsuranceRatePercent: 2.7,
    reductionThresholds: [1_633, 2_449, 4_897],
    incomeTax: COMMON_INCOME_TAX,
    employee: { ...EMPLOYEE_FROM_2025, socialRateRetired: 0.006 },
    status: { minimumWage: 'verified', averageWage: 'verified', pausalniDanMonthly: 'verified', incomeTax: 'researched', employee: 'researched' },
    sources: {
      averageWage: [{ label: 'nařízení vlády 365/2025 Sb.', url: 'https://www.zakonyprolidi.cz/cs/2025-365' }, LAW.vzpAverageWage, SOURCE.cssz2026],
      minimumWage: [SOURCE.minimumWage2026, SOURCE.coefficient2025And2026, SOURCE.mpsvMinimumWage2026, LAW.minimumWageMpsv],
      pausalniDanMonthly: [LAW.pausalniDan2025, LAW.incomeTax, LAW.social, LAW.health],
      socialMinimumShare: [
        LAW.social,
        {
          label: 'ČSSZ: změna pojistného OSVČ od 1. 7. 2026',
          url: 'https://www.cssz.gov.cz/-/informace-pro-osvc-o-zmene-pojistneho-na-duchodove-pojisteni-od-1-7-2026',
        },
      ],
      incomeTax: [LAW.incomeTax, SOURCE.fsGeneralInfo2026, SOURCE.fsQa2025And2026],
      employee: [LAW.social, SOURCE.mpsvSocialInsurance2026, SOURCE.csszRates, LAW.health, SOURCE.vzpEmployeeSplit],
    },
  },
  2027: {
    year: 2027,
    validFrom: '2027-01-01',
    workingDays: 252,
    generalAssessmentBase: 48_900,
    conversionCoefficient: 1.0565,
    averageWage: 51_663,
    minimumWage: 24_900,
    socialMinimumShare: 0.35,
    newOsvcSocialMinimumShare: 0.25,
    socialProfitShare: 0.55,
    pausalniDanMonthly: [9_661, 16_745, 27_139],
    salesRegistrationSurcharge: 1_400,
    sicknessEligibilityThreshold: 5_000,
    sicknessInsuranceRatePercent: 2.7,
    // § 22 odst. 1 zákona 187/2006 Sb.: (48 900 × 1,0565) / 30, × 1,5 and × 3, rounded up
    reductionThresholds: [1_723, 2_584, 5_167],
    incomeTax: {
      ...COMMON_INCOME_TAX,
      studentCredit: 4_020,
      childPlacementCreditCapIsMinimumWage: true,
      salesRegistrationCredit: 5_000,
    },
    employee: { ...EMPLOYEE_FROM_2025, socialRateRetired: 0.006 },
    // derived from the 2027 wording of the acts; the agencies publish their own figures in December
    status: {
      minimumWage: 'verified',
      averageWage: 'researched',
      pausalniDanMonthly: 'researched',
      socialMinimumShare: 'researched',
      sicknessEligibilityThreshold: 'researched',
      reductionThresholds: 'researched',
      salesRegistrationSurcharge: 'researched',
      // child credits for 2027 have one source so far (the 2027 wording of § 35c)
      incomeTax: 'researched',
      employee: 'researched',
    },
    sources: {
      averageWage: [{ label: 'nařízení vlády 177/2026 Sb.', url: 'https://www.zakonyprolidi.cz/cs/2026-177' }],
      minimumWage: [
        SOURCE.minimumWage2027,
        SOURCE.coefficient2027,
        { label: 'MPSV: minimální mzda 2027', url: 'https://mpsv.gov.cz/minimalni-mzda-v-roce-2027-vzroste-na-24-900-korun' },
      ],
      employee: [LAW.social, LAW.health],
      pausalniDanMonthly: [LAW.incomeTax, LAW.social, LAW.health],
      socialMinimumShare: [LAW.social],
      incomeTax: [LAW.incomeTax, { label: 'zákon 180/2026 Sb. (slevy od 2027)', url: 'https://www.zakonyprolidi.cz/cs/2026-180' }],
      reductionThresholds: [LAW.sickness],
    },
  },
}

/** Values whose status is not 'verified', for the "unverified" badge. */
export const unverifiedValuesFor = ({ data }: { data: TaxYearData }) =>
  Object.entries(data.status)
    .filter(([, status]) => status !== 'verified')
    .map(([key]) => key)

export type YearKind = 'historical' | 'current' | 'next'

/**
 * The rolling window of tax years: the two previous years, the current one and the next (PRD "Tax years").
 *
 * @param {object} params
 * @param {Date} params.today
 * @returns {number[]} four years, oldest first
 */
export const taxYearWindow = ({ today }: { today: Date }) => {
  const current = today.getFullYear()
  return [current - 2, current - 1, current, current + 1]
}

/**
 * What the app shows for a year: its kind in the window and whether official data exists.
 *
 * @param {object} params
 * @param {number} params.year
 * @param {Date} params.today
 * @returns {{ year: number, kind: YearKind, hasData: boolean }}
 */
export const yearInfoFor = ({ year, today }: { year: number; today: Date }) => {
  const current = today.getFullYear()
  const kind: YearKind = year < current ? 'historical' : year === current ? 'current' : 'next'
  return { year, kind, hasData: year in TAX_YEARS }
}

/**
 * Prefill for the user's own numbers for a year without official data: the latest known year,
 * relabelled, with every value marked 'custom'.
 *
 * @param {object} params
 * @param {number} params.year the year without data
 * @returns {TaxYearData}
 */
export const customYearDataFor = ({ year }: { year: number }): TaxYearData => {
  const latest = TAX_YEARS[Math.max(...Object.keys(TAX_YEARS).map(Number))]!
  return { ...latest, year, validFrom: `${year}-01-01`, status: { averageWage: 'custom' }, sources: {} }
}

/**
 * Turns one year's data into the `rates` objects the calculators take.
 *
 * @param {object} params
 * @param {TaxYearData} params.data
 * @param {boolean} [params.isNewOsvc=false] lower minimum SP base in the first three years
 */
export const buildYearRates = ({ data, isNewOsvc = false }: { data: TaxYearData; isNewOsvc?: boolean }) => {
  const minimums = calculateOsvcMinimums({
    averageWage: data.averageWage,
    isNewOsvc,
    rates: { socialMinimumShare: data.socialMinimumShare, newOsvcSocialMinimumShare: data.newOsvcSocialMinimumShare },
  })
  const incomeTax: OsvcIncomeTaxRates = {
    ...data.incomeTax,
    solidarityThreshold: minimums.solidarityThreshold,
    minimumWage: data.minimumWage,
  }
  const plan: OsvcPlanRates = {
    incomeTax,
    healthInsurance: { minimumAssessmentBase: minimums.minimumHealthYearlyBase },
    socialInsurance: {
      profitShare: data.socialProfitShare,
      minimumAssessmentBase: minimums.minimumSocialYearlyBase,
      maximumAssessmentBase: minimums.maximumSocialYearlyBase,
    },
  }
  const monthly = (yearly: number) => yearly / 12
  const employee: EmployeeNetWageRates = {
    minimumWage: data.minimumWage,
    ...data.employee,
    baseTaxRate: data.incomeTax.baseTaxRate,
    solidarityTaxRate: data.incomeTax.solidarityTaxRate,
    monthlySolidarityThreshold: data.averageWage * 3,
    payerCredit: monthly(data.incomeTax.payerCredit),
    ...(data.incomeTax.studentCredit === undefined ? {} : { studentCredit: monthly(data.incomeTax.studentCredit) }),
    ztpHolderCredit: monthly(data.incomeTax.ztpHolderCredit),
    disabilityDegree1or2Credit: monthly(data.incomeTax.disabilityDegree1or2Credit),
    disabilityDegree3Credit: monthly(data.incomeTax.disabilityDegree3Credit),
    childCreditsMonthly: data.incomeTax.childCreditsMonthly,
  }
  return {
    minimums,
    plan,
    employee,
    pausalniDanMonthly: data.pausalniDanMonthly,
    sicknessInsurance: {
      sicknessInsuranceRatePercent: data.sicknessInsuranceRatePercent,
      employeeEligibilityThreshold: data.sicknessEligibilityThreshold,
    },
    benefits: { reductionThresholds: data.reductionThresholds, sicknessInsuranceRatePercent: data.sicknessInsuranceRatePercent },
  }
}

export type YearRates = ReturnType<typeof buildYearRates>
