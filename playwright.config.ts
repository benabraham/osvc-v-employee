import { defineConfig, devices } from '@playwright/test'

// Same base path as the production build on GitHub Pages
const BASE_PATH = '/osvc-v-employee/'
const PORT = 4173
const APP_URL = `http://localhost:${PORT}${BASE_PATH}`

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // Builds the production bundle (service worker included) and serves it like GitHub Pages does
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: APP_URL,
    env: { BASE_PATH },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
