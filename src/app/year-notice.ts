/**
 * Which notice the year screen shows for the active year. Pure: the component passes in what the store knows.
 */

/**
 * - none: nothing to say
 * - missing: no official values and no custom values in use, so the user waits or enters their own
 * - customInUse: no official values yet, and the user's own values are in use
 * - officialAvailable: official values exist next to the user's own values, and the switch question is open
 */
export type YearNotice = 'none' | 'missing' | 'customInUse' | 'officialAvailable'

/**
 * The notice for a year.
 *
 * @param {object} params
 * @param {boolean} params.hasOfficialData the year has official values in the app
 * @param {boolean} params.hasCustomData the user has entered own values for the year
 * @param {boolean} params.isUsingCustomData the year is calculated with the own values
 * @param {boolean} params.isOfficialPromptAnswered the user has already answered the switch question
 * @returns {YearNotice}
 */
export const yearNoticeFor = ({
  hasOfficialData,
  hasCustomData,
  isUsingCustomData,
  isOfficialPromptAnswered,
}: {
  hasOfficialData: boolean
  hasCustomData: boolean
  isUsingCustomData: boolean
  isOfficialPromptAnswered: boolean
}): YearNotice => {
  if (!hasOfficialData) return isUsingCustomData ? 'customInUse' : 'missing'
  const isSwitchQuestionOpen = hasCustomData && !isOfficialPromptAnswered
  return isSwitchQuestionOpen ? 'officialAvailable' : 'none'
}
