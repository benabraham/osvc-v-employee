/**
 * What the user enters, for one tax year. This shape is the contract between the state (stored, shared,
 * exported) and the model (computeResults). Change it only together with the state's schema migration.
 */
import type { ExpenseRate } from '../calc/osvc-regimes'
import type { TaxYearData } from '../data/tax-years'

/** One dependent child the child credit is claimed for, in the order the credit is claimed. */
export type ChildInput = {
  /** months in the year the credit is claimed for, 0–12 */
  months: number
  /** holder of a ZTP/P card: the credit for this child doubles (§ 35c odst. 1 zákona 586/1992 Sb.) */
  hasZtpP: boolean
  /** yearly preschool fees (školkovné), a credit from 2027 */
  preschoolFees: number
}

/** One row of the costs list (replaces the sheet's "náklady" tab). */
export type CostItem = {
  id: string
  name: string
  /** price in Kč */
  price: number
  /** months the purchase is spread over (amortisation); the yearly cost is price × 12 / months */
  months: number
}

export type DisabilityDegree = 'none' | 'degree1or2' | 'degree3'

export type Inputs = {
  /** working days in the year; null means the year's default (TaxYearData.workingDays) */
  workingDays: number | null
  vacationDays: number
  /** hours worked per day, including non-billable work */
  hoursPerDay: number
  nonBillableHoursPerYear: number
  hourlyRate: number
  usesPausalniDan: boolean
  /** 2027+: band 1 surcharge instead of registering sales */
  withSalesRegistrationSurcharge: boolean
  expenseRate: ExpenseRate
  /** start year or the two after it: lower minimum SP base */
  isNewOsvc: boolean
  children: ChildInput[]
  credits: {
    /** spouse credit: spouse earns at most 68 000 Kč a year and cares for a child under 3 */
    spouse: boolean
    /** spouse holds a ZTP/P card: the spouse credit doubles (§ 35ba odst. 1 písm. b) */
    spouseHasZtpP: boolean
    disability: DisabilityDegree
    ztpHolder: boolean
    /** months as a student (2027+) */
    studentMonths: number
    /** first year with registered sales (2027+, sleva na evidenci tržeb) */
    isFirstYearWithRegisteredSales: boolean
  }
  deductions: {
    /** money donations in Kč a year */
    donations: number
    /** number of unpaid blood donations, each valued at 3 000 Kč as a donation (§ 15 odst. 1) */
    bloodDonations: number
    /** organ or stem cell donations, each valued at 20 000 Kč */
    organDonations: number
    /** mortgage interest on housing acquired from 2021 */
    mortgageInterest: number
    /** mortgage interest on housing acquired before 2021 */
    mortgageInterestPre2021: number
    /** months the interest was paid in the year; the cap is prorated (§ 15 odst. 4) */
    mortgageMonths: number
    /** pension savings, DIP, life and long-term care insurance, above the state-supported part */
    retirementProducts: number
  }
  sicknessInsurance: {
    enabled: boolean
    /** monthly assessment base; null means the minimum */
    monthlyAssessmentBase: number | null
  }
  /** months of reserve to build each year */
  reserveMonths: number
  costs: CostItem[]
  /** invoice amount for the splitter */
  invoiceAmount: number
  /** values the user overrode (the sheet's blue cells); null means calculated */
  overrides: {
    taxDeductibleCosts: number | null
    totalLevies: number | null
  }
}

/** The sheet's default costs list (4 rows, 47 000 Kč a year). */
export const DEFAULT_COSTS: CostItem[] = [
  { id: 'hardware', name: 'hardware', price: 60_000, months: 36 },
  { id: 'software', name: 'software', price: 1_000, months: 1 },
  { id: 'accountant', name: 'účetní', price: 5_000, months: 12 },
  { id: 'education', name: 'vzdělávání (knihy, konference)', price: 10_000, months: 12 },
]

/**
 * Default inputs, as in the year sheets (PRD "Inputs"). Working days stay null so each year uses its own.
 *
 * @returns {Inputs}
 */
export const defaultInputs = (): Inputs => ({
  workingDays: null,
  vacationDays: 20,
  hoursPerDay: 5,
  nonBillableHoursPerYear: 80,
  hourlyRate: 650,
  usesPausalniDan: false,
  withSalesRegistrationSurcharge: false,
  expenseRate: 0.6,
  isNewOsvc: false,
  children: [],
  credits: {
    spouse: false,
    spouseHasZtpP: false,
    disability: 'none',
    ztpHolder: false,
    studentMonths: 0,
    isFirstYearWithRegisteredSales: false,
  },
  deductions: {
    donations: 0,
    bloodDonations: 0,
    organDonations: 0,
    mortgageInterest: 0,
    mortgageInterestPre2021: 0,
    mortgageMonths: 12,
    retirementProducts: 0,
  },
  sicknessInsurance: { enabled: false, monthlyAssessmentBase: null },
  reserveMonths: 1.5,
  costs: DEFAULT_COSTS.map((cost) => ({ ...cost })),
  invoiceAmount: 10_000,
  overrides: { taxDeductibleCosts: null, totalLevies: null },
})

/**
 * Working days for a year: the user's value, or the year's default.
 *
 * @param {object} params
 * @param {Inputs} params.inputs
 * @param {TaxYearData} params.data the year's official or custom data
 * @returns {number}
 */
export const workingDaysFor = ({ inputs, data }: { inputs: Inputs; data: TaxYearData }) =>
  inputs.workingDays ?? data.workingDays
