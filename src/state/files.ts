/**
 * Browser helpers for files and sharing: save a text file, read an uploaded one, and share the app through
 * the system share sheet or the clipboard.
 */

/** The part of `navigator` that sharing uses; the real one fits, and tests pass fakes. */
export type ShareCapableNavigator = {
  share?: (data: ShareData) => Promise<void>
  clipboard?: { writeText: (text: string) => Promise<void> }
}

/** 'shared' via the share sheet, 'copied' to the clipboard, or 'failed' (nothing was shared or copied). */
export type ShareOutcome = 'shared' | 'copied' | 'failed'

/**
 * Saves text as a file through a temporary link, the way a download button does.
 *
 * @param {object} params
 * @param {string} params.filename e.g. "osvc-backup-2026-11-04.json"
 * @param {string} params.text the file content
 * @param {Document} params.document
 * @param {string} [params.mimeType='application/json;charset=utf-8']
 */
export const downloadTextFile = ({
  filename,
  text,
  document,
  mimeType = 'application/json;charset=utf-8',
}: {
  filename: string
  text: string
  document: Document
  mimeType?: string
}) => {
  const url = URL.createObjectURL(new Blob([text], { type: mimeType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  // the download starts from the link's click; releasing the URL straight away can cancel it in some browsers
  setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

/**
 * Reads an uploaded file as text.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export const readTextFile = (file: File): Promise<string> => file.text()

const isAbortError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'

/** Copies the link to the clipboard; 'failed' when there is no clipboard or it refuses. */
const copyLink = async ({ navigator, url }: { navigator: ShareCapableNavigator; url: string }): Promise<ShareOutcome> => {
  const clipboard = navigator.clipboard
  if (!clipboard) return 'failed'
  try {
    await clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

/**
 * Shares the app link: the system share sheet when the browser has one, otherwise the clipboard.
 * If the share sheet fails for another reason, the link is copied instead. A user who closes the share
 * sheet gets 'failed' and nothing is copied.
 *
 * @param {object} params
 * @param {ShareCapableNavigator} params.navigator window.navigator in the app
 * @param {string} params.url the app's link
 * @param {string} params.title
 * @param {string} params.text
 * @returns {Promise<ShareOutcome>}
 */
export const shareApp = async ({
  navigator,
  url,
  title,
  text,
}: {
  navigator: ShareCapableNavigator
  url: string
  title: string
  text: string
}): Promise<ShareOutcome> => {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (error) {
      if (isAbortError(error)) return 'failed'
    }
  }
  return copyLink({ navigator, url })
}
