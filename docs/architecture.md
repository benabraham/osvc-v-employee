# Architecture

How the app is put together, layer by layer. Each layer depends only on the ones above it in this list.

| Layer | Directory | What it does | Depends on |
| --- | --- | --- | --- |
| Calculators | `src/calc/` | Pure functions from the law: tax, insurance, paušální daň, payroll, benefits, the PRD plan | nothing |
| Year data | `src/data/` | One `TaxYearData` per tax year with sources and status; `buildYearRates` turns it into calculator `rates` | calc |
| Model | `src/model/` | `Inputs` (what the user enters) → `Results` (everything the screens show); reverse search, warnings, hints | calc, data |
| State | `src/state/` | Preact signals with the whole app state; persistence, share links, export and import, scenarios | model, data |
| i18n | `src/i18n/` | Czech and English messages, money and number formatting | nothing |
| UI | `src/app/`, `src/ui/`, `src/screens/` | Preact components and screens | everything above |
| Styles | `src/styles/` | Plain CSS with custom properties and native nesting (Baseline 2024) | — |

Rules that hold everywhere:

- Pure functions, RORO (one object in, one object out) for two or more parameters, no classes, arrow functions, no semicolons.
- Every exported function has JSDoc; calculators cite the act and paragraph.
- Tests sit next to the code (`*.test.ts`, `*.test.tsx`). UI tests start with `// @vitest-environment happy-dom` and use `@testing-library/preact`.
- No network at runtime. Everything the app needs ships in the bundle and the service worker caches it.

## Stack

- Vite 8, Preact 11 with `@preact/signals`, TypeScript 7, Vitest 5, pnpm.
- `vite-plugin-pwa` (Workbox `generateSW`, `registerType: 'prompt'`): the app shows "new version, reload" instead of reloading on its own.
- No CSS framework, so the initial JavaScript stays under the PRD's 50 KB gzipped budget.
- GitHub Pages serves `dist/` from the `gh-pages` branch; `.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`. The base path is `/osvc-v-employee/` (override with `BASE_PATH`).

## Year data (`src/data/tax-years.ts`)

- `TAX_YEARS[year]` holds the official values for 2024–2027, each with `sources` and a `status` (`verified` unless listed otherwise; `researched` = from the law only, not yet published by the agency; `custom` = the user's own numbers).
- `buildYearRates({ data, isNewOsvc })` returns `{ minimums, plan, employee, pausalniDanMonthly, sicknessInsurance, benefits }`, the `rates` objects for the calculators.
- `taxYearWindow({ today })` gives the four years in the window; `yearInfoFor({ year, today })` says whether a year is historical, current or next and whether it has data; `customYearDataFor({ year })` prefills the user's own numbers.
- The derivation check of the PRD (average wage, minimum bases, paušální daň, reduction thresholds) is `src/data/tax-years.test.ts` and runs in CI.

## Model (`src/model/`)

- `inputs.ts`: the `Inputs` type, `defaultInputs()`, `DEFAULT_COSTS`, `workingDaysFor`.
- `compute.ts`: `computeResults({ inputs, data })` → `Results`. It runs the whole pipeline for one year: costs list, sickness insurance, credits and deductions, the PRD plan (`calculateOsvcPlan`), the paušální daň band and hint, the gross salary equivalent (`findGrossWageForNetWage`) with the same personal credits, and the warnings.
- `reverse.ts`: target net monthly income → the smallest hourly rate that reaches it.
- Parity fixtures for 2024–2027 and the PRD edge cases are in `compute.test.ts`.

## State (`src/state/`)

- One persisted object (`PersistedState`, versioned) in `localStorage`; every write is wrapped in try/catch so a private window still works.
- Each year keeps its own inputs; with "sync inputs across years" on, all years share one set.
- Share link: `#/share/<base64url JSON>` with the year and inputs only. Export and import: a JSON file of the whole state.

## i18n (`src/i18n/`)

- Messages live per feature in `src/i18n/messages/<feature>.ts`, each exporting `{ cs: {...}, en: {...} }` with the same keys. Czech is the default.
- `formatMoney(1234.5, 'cs')` → `1 235 Kč`; the spaces are non-breaking.

## UI

- Hash routing: `#/split` (invoice splitter, the default once set up), `#/calc`, `#/costs`, `#/scenarios`, `#/reverse`, `#/benefits`, `#/data`, `#/about`.
- The header always shows the year switcher. Mobile: bottom navigation; desktop (≥ 960 px): inputs and results side by side.
- Results update on every keystroke. Key results are in an `aria-live="polite"` region.
