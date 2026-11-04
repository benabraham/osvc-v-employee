/**
 * Optional local Lighthouse check of the production build. Serve the build first, in another shell:
 *   pnpm build && pnpm preview --port 4173 --strictPort
 * then run `pnpm lighthouse`. It prints the category scores and exits 1 when performance < 95 or accessibility < 100.
 *
 * Lighthouse 13 no longer has a PWA category, so the PWA-ish score counts the installability files directly.
 * It is printed but does not fail the run.
 */
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium } from '@playwright/test'

const execFileAsync = promisify(execFile)
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const lighthouseCli = join(projectRoot, 'node_modules', 'lighthouse', 'cli', 'index.js')
const APP_URL = 'http://localhost:4173/osvc-v-employee/'
const MINIMUM_PERFORMANCE_SCORE = 0.95
const REQUIRED_ACCESSIBILITY_SCORE = 1

type LighthouseReport = { categories: Record<string, { score: number | null }> }

type PwaCheck = { name: string; passed: boolean }

/**
 * Checks that the app is served and says what it is.
 *
 * @returns {Promise<void>} throws with a hint when the preview server is not running
 */
const assertServerRunning = async (): Promise<void> => {
  const response = await fetch(APP_URL).catch(() => null)
  if (response?.ok) return
  throw new Error(`No app at ${APP_URL}. Run "pnpm build && pnpm preview --port 4173 --strictPort" first.`)
}

/**
 * Finds the Chromium that Playwright installed, the same one the e2e tests use.
 *
 * @returns {string} absolute path of the Chromium binary
 */
const chromiumPath = (): string => {
  const path = chromium.executablePath()
  if (!existsSync(path)) throw new Error(`Chromium not found at ${path}. Set PLAYWRIGHT_BROWSERS_PATH to the Playwright browsers folder.`)
  return path
}

/**
 * Runs the Lighthouse CLI on the app with the Playwright Chromium, headless and without the sandbox.
 *
 * @param {{ chromePath: string }} options
 * @returns {Promise<LighthouseReport>} the parsed JSON report
 */
const runLighthouse = async ({ chromePath }: { chromePath: string }): Promise<LighthouseReport> => {
  const reportDirectory = await mkdtemp(join(tmpdir(), 'lighthouse-'))
  const reportPath = join(reportDirectory, 'report.json')
  await execFileAsync(
    process.execPath,
    [
      lighthouseCli,
      APP_URL,
      '--output=json',
      `--output-path=${reportPath}`,
      '--only-categories=performance,accessibility,best-practices',
      `--chrome-path=${chromePath}`,
      '--chrome-flags=--headless --no-sandbox',
      '--quiet',
    ],
    { timeout: 300_000 },
  )
  return JSON.parse(await readFile(reportPath, 'utf8')) as LighthouseReport
}

/**
 * Checks the files that make the app installable and usable offline: manifest, its icons, service worker, Apple icon.
 *
 * @returns {Promise<PwaCheck[]>}
 */
const pwaChecks = async (): Promise<PwaCheck[]> => {
  const manifestResponse = await fetch(new URL('manifest.webmanifest', APP_URL)).catch(() => null)
  const manifest = manifestResponse?.ok ? ((await manifestResponse.json()) as { icons?: { src: string }[] }) : null
  const iconChecks = await Promise.all(
    (manifest?.icons ?? []).map(async (icon) => {
      const response = await fetch(new URL(icon.src, APP_URL)).catch(() => null)
      return { name: `icon ${icon.src}`, passed: response?.ok === true }
    }),
  )
  const serviceWorkerOk = (await fetch(new URL('sw.js', APP_URL)).catch(() => null))?.ok === true
  const appleIconOk = (await fetch(new URL('apple-touch-icon.png', APP_URL)).catch(() => null))?.ok === true
  return [
    { name: 'manifest.webmanifest', passed: manifest !== null },
    ...iconChecks,
    { name: 'sw.js (service worker)', passed: serviceWorkerOk },
    { name: 'apple-touch-icon.png', passed: appleIconOk },
  ]
}

/**
 * Turns a Lighthouse category score (0 to 1, null when not computed) into a percentage.
 *
 * @param {number | null | undefined} score
 * @returns {number}
 */
const percentOf = (score: number | null | undefined): number => Math.round((score ?? 0) * 100)

const main = async (): Promise<void> => {
  await assertServerRunning()
  const report = await runLighthouse({ chromePath: chromiumPath() })
  const performance = report.categories['performance']?.score ?? 0
  const accessibility = report.categories['accessibility']?.score ?? 0
  const bestPractices = report.categories['best-practices']?.score ?? 0
  const checks = await pwaChecks()
  const pwaScore = checks.filter((check) => check.passed).length / checks.length

  console.log(`Lighthouse for ${APP_URL}`)
  console.log(`  performance     ${percentOf(performance)}  (minimum 95)`)
  console.log(`  accessibility   ${percentOf(accessibility)}  (must be 100)`)
  console.log(`  best practices  ${percentOf(bestPractices)}`)
  console.log(`  PWA-ish         ${Math.round(pwaScore * 100)}  (installability files, not a Lighthouse score)`)
  for (const check of checks) {
    console.log(`    ${check.passed ? 'ok ' : 'MISSING'} ${check.name}`)
  }

  const failures = [
    performance < MINIMUM_PERFORMANCE_SCORE ? 'performance is below 95' : null,
    accessibility < REQUIRED_ACCESSIBILITY_SCORE ? 'accessibility is below 100' : null,
  ].filter((failure): failure is string => failure !== null)
  if (failures.length > 0) {
    console.error(`Lighthouse targets missed: ${failures.join('; ')}`)
    process.exitCode = 1
  }
}

await main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
