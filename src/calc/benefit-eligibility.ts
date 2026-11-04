/** zákon 187/2006 Sb. § 32 odst. 2: days of sickness insurance needed in the two years before maternity benefit. */
export const MATERNITY_INSURED_DAYS_IN_TWO_YEARS = 270
/** § 32 odst. 3: an OSVČ also needs this many days of OSVČ sickness insurance in the last year. */
export const MATERNITY_OSVC_INSURED_DAYS_IN_LAST_YEAR = 180
/** § 24 and § 38a odst. 3: months of OSVČ sickness insurance right before sickness or paternity benefit. */
export const OSVC_WAITING_MONTHS = 3
/** The waiting period does not apply when OSVČ insurance began within this many days after a job ended… */
export const DAYS_TO_CONTINUE_FROM_JOB = 8
/** …and the job was insured for at least its last 3 months. */
export const JOB_INSURED_MONTHS_AT_END = 3

type Eligibility<Condition extends string> = { isEligible: boolean; unmetConditions: Condition[] }

const eligibilityFrom = <Condition extends string>(checks: [Condition, boolean][]): Eligibility<Condition> => {
  const unmetConditions = checks.filter(([, isMet]) => !isMet).map(([condition]) => condition)
  return { isEligible: unmetConditions.length === 0, unmetConditions }
}

/**
 * Maternity benefit (peněžitá pomoc v mateřství) eligibility.
 *
 * @param {object} params
 * @param {number} params.insuredDaysInLastTwoYears days of sickness insurance in the two years before the benefit starts
 * @param {boolean} [params.isOsvc=false]
 * @param {number} [params.osvcInsuredDaysInLastYear=0] days of OSVČ sickness insurance in the last year
 * @returns {{ isEligible: boolean, unmetConditions: string[] }}
 */
export const isEligibleForMaternityBenefit = ({
  insuredDaysInLastTwoYears,
  isOsvc = false,
  osvcInsuredDaysInLastYear = 0,
}: {
  insuredDaysInLastTwoYears: number
  isOsvc?: boolean
  osvcInsuredDaysInLastYear?: number
}) =>
  eligibilityFrom([
    ['insuredDaysInLastTwoYears', insuredDaysInLastTwoYears >= MATERNITY_INSURED_DAYS_IN_TWO_YEARS],
    ['osvcInsuredDaysInLastYear', !isOsvc || osvcInsuredDaysInLastYear >= MATERNITY_OSVC_INSURED_DAYS_IN_LAST_YEAR],
  ])

type OsvcWaitingPeriod = {
  /** whole months of OSVČ sickness insurance right before the benefit */
  osvcInsuredMonthsBefore?: number
  /** days between the end of a job and the start of OSVČ sickness insurance */
  daysBetweenJobAndOsvcInsurance?: number
  /** months the job was sickness-insured at its end */
  employeeInsuredMonthsAtJobEnd?: number
}

const meetsOsvcWaitingPeriod = ({
  osvcInsuredMonthsBefore = 0,
  daysBetweenJobAndOsvcInsurance,
  employeeInsuredMonthsAtJobEnd = 0,
}: OsvcWaitingPeriod) => {
  const continuesFromJob =
    daysBetweenJobAndOsvcInsurance !== undefined &&
    daysBetweenJobAndOsvcInsurance <= DAYS_TO_CONTINUE_FROM_JOB &&
    employeeInsuredMonthsAtJobEnd >= JOB_INSURED_MONTHS_AT_END
  return osvcInsuredMonthsBefore >= OSVC_WAITING_MONTHS || continuesFromJob
}

/**
 * OSVČ sickness benefit eligibility (§ 24): 3 months of OSVČ sickness insurance right before the incapacity,
 * unless it continued within 8 days from a job insured for its last 3 months. Employees have no waiting period.
 *
 * @param {OsvcWaitingPeriod} params
 * @returns {{ isEligible: boolean, unmetConditions: string[] }}
 */
export const isEligibleForOsvcSicknessBenefit = (params: OsvcWaitingPeriod) =>
  eligibilityFrom([['osvcWaitingPeriod', meetsOsvcWaitingPeriod(params)]])

/**
 * Paternity benefit (otcovská) eligibility (§ 38a odst. 3): an insured employee qualifies;
 * an OSVČ needs the same 3-month waiting period as for sickness benefit.
 *
 * @param {OsvcWaitingPeriod & { isOsvc?: boolean }} params
 * @returns {{ isEligible: boolean, unmetConditions: string[] }}
 */
export const isEligibleForPaternityBenefit = ({ isOsvc = false, ...waitingPeriod }: OsvcWaitingPeriod & { isOsvc?: boolean }) =>
  eligibilityFrom([['osvcWaitingPeriod', !isOsvc || meetsOsvcWaitingPeriod(waitingPeriod)]])
