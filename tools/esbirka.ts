/**
 * Download an act from e-Sbírka (the official Sbírka zákonů) as plain text, as it reads on a given date.
 * e-Sbírka also serves past and future wordings (e.g. the 2027 text before 2027), with no login.
 *
 * Usage:
 *   pnpm esbirka /sb/1992/589/2027-01-01                      print the whole act
 *   pnpm esbirka /sb/1992/589/2027-01-01 --out sp-2027.txt    save it to a file
 *   pnpm esbirka /sb/1992/589/2027-01-01 --find "35 % průměrné mzdy"   show each match in context
 *
 * The path is the act's ELI path without the `/eli/cz` prefix: /sb/<year>/<number>/<YYYY-MM-DD>.
 */
import { writeFile } from 'node:fs/promises'

const API_BASE = 'https://e-sbirka.gov.cz/sbr-cache/dokumenty-sbirky/'

const NAMED_ENTITIES: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

/**
 * Decode the HTML entities e-Sbírka uses (named and numeric).
 *
 * @param {string} text
 * @returns {string}
 */
export const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16))
    if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10))
    return NAMED_ENTITIES[code.toLowerCase()] ?? match
  })

/**
 * Plain text of one e-Sbírka fragment: tags removed, entities decoded, whitespace collapsed.
 *
 * @param {{ xhtml?: string, text?: string }} fragment
 * @returns {string}
 */
export const fragmentText = (fragment: { xhtml?: string; text?: string }) =>
  decodeEntities((fragment.xhtml ?? fragment.text ?? '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Every occurrence of a phrase with some text around it; whitespace in the text is collapsed first.
 *
 * @param {object} params
 * @param {string} params.text
 * @param {string} params.phrase
 * @param {number} [params.context=300] characters shown on each side
 * @returns {string[]}
 */
export const findPhrase = ({ text, phrase, context = 300 }: { text: string; phrase: string; context?: number }) => {
  const flat = text.replace(/\s+/g, ' ')
  const positions = [...flat.matchAll(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map(
    (match) => match.index ?? 0,
  )
  return positions.map((position) =>
    flat.slice(Math.max(0, position - context), position + phrase.length + context).trim(),
  )
}

const fetchJson = async (url: string) => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`e-Sbírka answered ${response.status} for ${url}`)
  return response.json() as Promise<any>
}

/**
 * Download the act at the given ELI path and return its metadata and full text.
 *
 * @param {object} params
 * @param {string} params.path e.g. /sb/1992/589/2027-01-01
 * @returns {Promise<{ title: string, validFrom: string, versionType: string, text: string }>}
 */
export const fetchActText = async ({ path }: { path: string }) => {
  const documentUrl = API_BASE + encodeURIComponent(path)
  const metadata = await fetchJson(documentUrl)
  const firstPage = await fetchJson(`${documentUrl}/fragmenty?cisloStranky=0`)
  const pageCount = Math.max(1, Number(firstPage.pocetStranek ?? 1))
  const laterPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) => fetchJson(`${documentUrl}/fragmenty?cisloStranky=${index + 1}`)),
  )
  const fragments = [firstPage, ...laterPages].flatMap((page) => page.seznam ?? [])
  return {
    title: String(metadata.uplnaCitace ?? metadata.nazev ?? path),
    validFrom: String(metadata.datumUcinnostiZneniOd ?? ''),
    versionType: String(metadata.typZneni ?? ''),
    text: fragments.map(fragmentText).filter(Boolean).join('\n'),
  }
}

const parseArguments = (argv: string[]) => {
  const valueAfter = (flag: string) => {
    const index = argv.indexOf(flag)
    return index >= 0 ? argv[index + 1] : undefined
  }
  return { path: argv.find((argument) => argument.startsWith('/sb/')), out: valueAfter('--out'), find: valueAfter('--find') }
}

const main = async () => {
  const { path, out, find } = parseArguments(process.argv.slice(2))
  if (!path) {
    console.error('Usage: pnpm esbirka /sb/<year>/<number>/<YYYY-MM-DD> [--out file.txt] [--find "phrase"]')
    process.exit(1)
  }
  const act = await fetchActText({ path })
  console.error(`${act.title}\nwording in force from ${act.validFrom} (${act.versionType}), ${act.text.length} characters`)
  if (out) await writeFile(out, `${act.text}\n`, 'utf8')
  if (find) {
    const matches = findPhrase({ text: act.text, phrase: find })
    console.log(matches.length ? matches.map((match) => `… ${match} …`).join('\n\n') : `"${find}" not found`)
  }
  if (!out && !find) console.log(act.text)
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
