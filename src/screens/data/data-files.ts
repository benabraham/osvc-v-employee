/**
 * Small helpers of the data screen: the backup file name, the app's own link, the clipboard, and the check of an
 * imported file before the user confirms it. Pure except for the clipboard call.
 */
import { EXPORT_APP_MARKER, isRecord, migrateToCurrentState } from '../../state'

/** Why a file cannot be imported: not JSON at all, or JSON that is not a state export this app can read. */
export type ImportProblem = 'invalidJson' | 'invalidFormat'

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * The file name of a backup: the local date, so the file a user saves today says today.
 *
 * @param {object} params
 * @param {Date} params.today
 * @returns {string} e.g. "osvc-v-zamestnanec-2026-11-04.json"
 */
export const exportFileNameFor = ({ today }: { today: Date }): string =>
  `osvc-v-zamestnanec-${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}.json`

/**
 * The address of the app without its hash, which is where the share links and the app link point.
 *
 * @param {object} params
 * @param {string} params.origin e.g. "https://example.org"
 * @param {string} params.pathname e.g. "/osvc-v-employee/"
 * @returns {string}
 */
export const appBaseUrlFor = ({ origin, pathname }: { origin: string; pathname: string }): string => `${origin}${pathname}`

/**
 * Checks a file's text as the store's import would, without changing anything, so a broken file is refused
 * before the user is asked to confirm the replacement of their data.
 *
 * @param {object} params
 * @param {string} params.text the file content
 * @returns {ImportProblem | undefined} undefined when the store can import it
 */
export const importProblemFor = ({ text }: { text: string }): ImportProblem | undefined => {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return 'invalidJson'
  }
  if (!isRecord(parsed) || parsed.app !== EXPORT_APP_MARKER || !isRecord(parsed.state)) return 'invalidFormat'
  if (migrateToCurrentState(parsed.state) === undefined) return 'invalidFormat'
  return undefined
}

/**
 * Copies text to the clipboard. Resolves false when there is no clipboard or the browser refuses.
 *
 * @param {object} params
 * @param {{ writeText: (text: string) => Promise<void> } | undefined} params.clipboard navigator.clipboard
 * @param {string} params.text
 * @returns {Promise<boolean>} whether the text is in the clipboard now
 */
export const copyText = async ({
  clipboard,
  text,
}: {
  clipboard: { writeText: (text: string) => Promise<void> } | undefined
  text: string
}): Promise<boolean> => {
  if (!clipboard) return false
  try {
    await clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
