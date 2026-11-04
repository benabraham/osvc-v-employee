/**
 * Renders the PWA icons from public/favicon.svg with Playwright's Chromium.
 *
 * Run with `pnpm icons` (Node 22 strips the types). Outputs:
 * - pwa-192x192.png, pwa-512x512.png: the rounded favicon with transparent corners
 * - maskable-512x512.png: full-bleed teal with the coin scaled to sit well inside the safe zone
 * - apple-touch-icon.png: 180 px, full-bleed teal and opaque (iOS rounds the corners itself)
 */
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from '@playwright/test'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDirectory = join(projectRoot, 'public')
const ICON_VIEWBOX_SIZE = 64
const FULL_BLEED_TEAL = `<rect width="${ICON_VIEWBOX_SIZE}" height="${ICON_VIEWBOX_SIZE}" fill="#0f766e"/>`

type FaviconParts = { roundedRect: string; coin: string }

type IconTarget = {
  fileName: string
  size: number
  backgroundMarkup: string
  coinScale: number
  omitBackground: boolean
}

/**
 * Pulls the rounded background and the coin group out of favicon.svg, so every variant shares one drawing.
 *
 * @param {string} faviconSvg contents of public/favicon.svg
 * @returns {FaviconParts} the markup of each part
 */
const faviconPartsOf = (faviconSvg: string): FaviconParts => {
  const roundedRect = /<rect[^>]*\brx="[^"]*"[^>]*\/>/.exec(faviconSvg)?.[0]
  const coin = /<g id="coin">[\s\S]*?<\/g>/.exec(faviconSvg)?.[0]
  if (roundedRect === undefined || coin === undefined) {
    throw new Error('public/favicon.svg needs a rounded <rect> and a <g id="coin"> group')
  }
  return { roundedRect, coin }
}

/**
 * Builds the SVG markup of one icon: its background, then the coin scaled around the centre.
 *
 * @param {{ coin: string, target: IconTarget }} options
 * @returns {string}
 */
const iconMarkup = ({ coin, target }: { coin: string; target: IconTarget }): string => {
  const centre = ICON_VIEWBOX_SIZE / 2
  const scaledCoin = `<g transform="translate(${centre} ${centre}) scale(${target.coinScale}) translate(${-centre} ${-centre})">${coin}</g>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${target.size}" height="${target.size}" viewBox="0 0 ${ICON_VIEWBOX_SIZE} ${ICON_VIEWBOX_SIZE}">${target.backgroundMarkup}${scaledCoin}</svg>`
}

/**
 * Rasterises one icon at its size and writes the PNG into public/.
 *
 * @param {{ page: Page, coin: string, target: IconTarget }} options
 * @returns {Promise<void>}
 */
const renderTarget = async ({ page, coin, target }: { page: Page; coin: string; target: IconTarget }): Promise<void> => {
  await page.setViewportSize({ width: target.size, height: target.size })
  await page.setContent(
    `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${iconMarkup({ coin, target })}</body></html>`,
  )
  await page.screenshot({
    path: join(publicDirectory, target.fileName),
    clip: { x: 0, y: 0, width: target.size, height: target.size },
    omitBackground: target.omitBackground,
  })
  console.log(`wrote public/${target.fileName} (${target.size}×${target.size})`)
}

const main = async (): Promise<void> => {
  const { roundedRect, coin } = faviconPartsOf(await readFile(join(publicDirectory, 'favicon.svg'), 'utf8'))
  const targets: IconTarget[] = [
    { fileName: 'pwa-192x192.png', size: 192, backgroundMarkup: roundedRect, coinScale: 1, omitBackground: true },
    { fileName: 'pwa-512x512.png', size: 512, backgroundMarkup: roundedRect, coinScale: 1, omitBackground: true },
    { fileName: 'maskable-512x512.png', size: 512, backgroundMarkup: FULL_BLEED_TEAL, coinScale: 0.8, omitBackground: false },
    { fileName: 'apple-touch-icon.png', size: 180, backgroundMarkup: FULL_BLEED_TEAL, coinScale: 1, omitBackground: false },
  ]

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ deviceScaleFactor: 1 })
    for (const target of targets) {
      await renderTarget({ page, coin, target })
    }
  } finally {
    await browser.close()
  }
}

await main()
