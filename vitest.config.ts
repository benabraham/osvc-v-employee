import preact from '@preact/preset-vite'
import { defineConfig } from 'vitest/config'

// Calculation tests run in Node; UI tests opt into a DOM with `// @vitest-environment happy-dom` at the top
export default defineConfig({
  plugins: [preact()],
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tools/**/*.test.ts'],
  },
})
