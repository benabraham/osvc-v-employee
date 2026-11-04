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

- Vite 8, Preact 11 with `@preact/signals`, TypeScript 7, Vitest 5, pnpm 10 (Node 22 or newer).
- `vite-plugin-pwa` (Workbox `generateSW`, `registerType: 'prompt'`): the app shows "new version, reload" instead of reloading on its own.
- No CSS framework, so the initial JavaScript stays small (see the performance budget below).
- Playwright for end-to-end tests, Lighthouse for the quality gate.
- GitHub Pages serves `dist/` from the `gh-pages` branch; `.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`. The base path is `/osvc-v-employee/` (override with `BASE_PATH`).

## Year data (`src/data/tax-years.ts`)

- `TAX_YEARS[year]` holds the official values for 2024–2027, each with `sources` and a `status` (`verified` unless listed otherwise; `researched` = from the law only, not yet published by the agency; `custom` = the user's own numbers).
- `buildYearRates({ data, isNewOsvc })` returns `{ minimums, plan, employee, pausalniDanMonthly, sicknessInsurance, benefits }`, the `rates` objects for the calculators.
- `taxYearWindow({ today })` gives the four years in the window (`[current − 2, current − 1, current, current + 1]`); `yearInfoFor({ year, today })` says whether a year is historical, current or next and whether it has data; `customYearDataFor({ year })` prefills the user's own numbers from the latest official year.
- `unverifiedValuesFor({ data })` lists the keys whose status is not `verified`; the header badge and each result carry that list.
- The derivation check of the PRD (average wage, minimum bases, paušální daň, reduction thresholds, sickness threshold) is `src/data/tax-years.test.ts` and runs in CI.

## Model (`src/model/`)

- `inputs.ts`: the `Inputs` type, `defaultInputs()`, `DEFAULT_COSTS` (the sheet's four rows, 47 000 Kč a year), `workingDaysFor` (the user's value, or the year's default).
- `compute.ts`: `computeResults({ inputs, data })` → `Results`. It runs the whole pipeline for one year: costs list, sickness insurance, credits and deductions, the PRD plan (`calculateOsvcPlan`), the paušální daň band and hint, the gross salary equivalent (`findGrossWageForNetWage`) with the same personal credits, and the warnings.
- `reverse.ts`: target net monthly income → the smallest whole-crown hourly rate that reaches it. It doubles the rate until the target is reached, then bisects. Overrides are cleared for the search. The search stops at 20 000 Kč an hour.
- `costs.ts`: a cost row costs `price × 12 ÷ months` a year; the list is summed and rounded to whole crowns.
- `year-change.ts`: the net monthly difference from the previous year for the same inputs.
- Parity fixtures for 2024–2027 and the PRD edge cases are in `compute.test.ts`.

## Results pipeline

1. A signal changes: an input (`store.setInput`, `updateInputs`, a cost row), the active year, or the year's data (official or the user's own numbers).
2. `activeInputs` and `activeYearData` (in `src/state/store.ts`) are computed signals and follow the change.
3. `results` (in `src/app/context.ts`) is a computed signal: it is `null` when the year has no data, else `computeResults({ inputs, data })`. Preact re-renders only the components that read it.
4. `yearOnYearChange` is a second computed signal; it compares with the previous year's official data.
5. Screens read `results.value` and `store.activeInputs.value`. They do no arithmetic of their own, except formatting.

The reverse screen (`findHourlyRateForNetMonthly`), the scenario comparison (`resultsForScenario`) and the benefits screen (`compareBenefits`) call the same model functions with their own inputs. Every key input change recalculates on the next keystroke; there is no submit button.

## State (`src/state/`)

- One persisted object (`PersistedState`, `version: 1`) in `localStorage` under the key `osvc-v-employee:v1`. Its fields: `locale`, `activeYear`, `syncInputs`, `sharedInputs`, `inputsByYear`, `customYearData`, `useCustomData`, `officialDataPromptAnswered`, `scenarios`, `hasCompletedSetup`, `theme`.
- Each year keeps its own inputs in `inputsByYear`. With "sync inputs across years" on (`syncInputs: true`), all years use `sharedInputs`. Turning sync on copies the active year into the shared set; turning it off copies the shared set into every year of the window.
- The store writes the whole state after every change, from one `effect`. Each write and read is wrapped in try/catch, so a private window or blocked storage still works (the state then lives in memory for the session).
- Reading is defensive: `normalizeState` replaces every wrong field with its default and never throws. An unknown version gives the first-visit state. `migrations` is empty while version 1 is the only version; a new version adds its migration there.
- Export (`exportState`) is pretty JSON: `{ app: 'osvc-v-employee', exportedAt, state }`. Import checks the marker and the version before it replaces anything.
- `createStore({ storage, today })` builds one store; `getAppStore()` (in `src/state/index.ts`) creates the app's store on first use, with `window.localStorage` (or a memory store) and today's date.

## Share link (`src/state/share.ts`)

- Format: `#/share/<token>`, where the token is base64url (no padding) of the compact JSON `{ "year": 2026, "inputs": { … } }`.
- Only the inputs that differ from `defaultInputs()` are written, key by key. A calculation with default inputs is just the year.
- Decoding: a token that is not base64url, not valid UTF-8 or not JSON gives `null`; so does a year outside 2000–2100. Inputs go through `normalizeInputs`, so missing fields take their defaults.
- Opening a link (`openHash` in `src/app/router.ts`): the year becomes active, its inputs are replaced by the link's inputs (or the shared set, when sync is on), the calculator opens and a toast confirms. A broken link shows a toast and opens the default screen.
- The link carries the year and the inputs only. It does not carry the user's own year values, scenarios, language or theme.

## Routing and screens (`src/app/router.ts`, `src/app/app.tsx`)

The hash names the screen. `route` is a signal; `startRouting` applies the current hash at start and on every `hashchange`. An empty or unknown hash opens the default screen: `#/split` once setup is complete, else `#/calc`.

| Route | Folder | Purpose | Loaded |
| --- | --- | --- | --- |
| `#/split` | `src/screens/split/` | Invoice splitter: one amount, the split into levies, costs, reserve, holiday and what can be spent | with the app |
| `#/calc` | `src/screens/calc/` | Calculator: inputs in four cards, live headline, warnings, detailed results, gross equivalent | with the app |
| `#/costs` | `src/screens/costs/` | Costs list with amortisation; rows can be deleted and restored | on first use |
| `#/scenarios` | `src/screens/scenarios/` | Saved scenarios, comparison table (desktop) or swipe cards (phone) | on first use |
| `#/reverse` | `src/screens/reverse/` | Target net income → hourly rate needed | on first use |
| `#/benefits` | `src/screens/benefits/` | Sickness, maternity and paternity benefit for an employee and an OSVČ, with eligibility | on first use |
| `#/data` | `src/screens/data/` | Share the calculation or the app, export and import, sync and language and theme settings, delete all data | on first use |
| `#/about` | `src/screens/about/` | How the calculation works, privacy, disclaimer, sources of the year's values with their status, licence, author | on first use |

`src/app/app.tsx` renders the skip link, the header, the navigation, the active screen, the footer and the toast host. The year notice (`YearDataNotice`) sits above every screen except `about` and `data`, because those do not depend on the year's values.

## Navigation layout (`src/app/nav.tsx`)

- Phones (under 960 px): a bottom bar with four primary links (`split`, `calc`, `costs`, `scenarios`) and a "Více" button. The button opens a menu with the other four screens. The menu closes after navigation, and the button is marked active when a secondary screen is on show.
- Desktop (960 px and wider): the same eight links in one column beside the screen.
- Every link is a hash link. The active one carries `aria-current="page"`.

## Lazy screens and message bundles

- `src/app/app.tsx` imports the split and calculator screens directly; the other six are `lazyScreen({ load: () => import(…) })` (`src/app/lazy-screen.tsx`). A lazy screen renders a placeholder until its chunk loads, then renders the screen. The service worker precaches every chunk, so lazy screens also work offline.
- Once the browser is idle (`requestIdleCallback`, or after 1.5 s), the app preloads all six, so switching screens is instant.
- Messages are per feature in `src/i18n/messages/<feature>.ts`. Each module exports `{ cs, en }` with the same keys. `src/i18n/messages/index.ts` has two lists:
  - `initialBundles`: `common`, `shell`, `values`, `calc`, `split`. They ship in the first download.
  - `allBundles`: every bundle. The tests check all of them.
- A lazily loaded screen module calls `registerBundle(bundle)` (`src/app/context.ts`) at the top. The bundle then joins the translator, and the translators are rebuilt. So a screen's text downloads with the screen, not with the app.

## i18n (`src/i18n/`)

- Czech is the default; English is selectable in the header and on the data screen. `<html lang>` follows the choice.
- Keys are dotted (`split.result.spend`). A key missing in English falls back to the Czech text, and a key missing in both shows the key itself. `bundles.test.ts` checks that cs and en have the same keys and placeholders.
- `formatMoney(1234.5, 'cs')` → `1 235 Kč`; the spaces are non-breaking. `formatNumber` and `formatDate` follow the same locales.

## UI and styles

- `src/ui/` holds shared components: `NumberField` (label, unit, help, `inputMode` decimal or numeric), `OverrideField` (a calculated value that can be overridden, with a badge and reset), `Money`, `ResultRow`, `Toggle`, `Segmented`, `Disclosure` (a native `<details>`, collapsed by default).
- The header (`src/app/header.tsx`) shows the app name, the year switcher with badges, the language toggle and the theme select.
- The footer (`src/app/footer.tsx`) shows the disclaimer, the date the year's values are valid from, a warning for a current year without data, the links to the year sheets, the issue tracker and the repository.
- Theme: `system` by default, or `light` or `dark` through `<html data-theme>`. The colours are custom properties; the dark values apply under `prefers-color-scheme` unless the user chose light, and under `data-theme="dark"`.

## PWA (`vite.config.ts`, `src/app/pwa-*.tsx`)

- Manifest: name "OSVČ vs. zaměstnanec", short name "OSVČ vs. zam.", standalone display, Czech language, icons at 192 and 512 px plus a maskable icon.
- `registerType: 'prompt'`, `injectRegister: false`: the app registers the service worker itself, through `useRegisterSW` in `ServiceWorkerPrompt`.
- Precache: Workbox precaches `**/*.{js,css,html,svg,png,webmanifest}` from the build, so the app works offline after the first visit.
- Updates: a new version waiting to take over shows the toast "Nová verze je k dispozici" with "Načíst znovu", which activates it and reloads. The first time the app is cached it shows "Aplikace je připravena offline" once.

## Performance budget

- PRD target: initial JavaScript under 50 KB gzipped; Lighthouse performance 95 or more.
- Measured on the production build (`pnpm build`, gzip level 6): the entry chunk plus the JSX runtime, the JavaScript a first visit loads, is about 41 kB gzipped (40 KiB). With the stylesheet (about 4.4 kB gzipped) the first load is about 45 kB.
- The `lighthouse` script (`scripts/lighthouse.ts`) fails the run below performance 0.95 or accessibility 1.0. Lighthouse 13 has no PWA category, so the script counts the installability files itself and prints that score without failing on it.

## Accessibility

- Skip link to `#main`, which takes focus without changing the hash (`src/app/app.tsx`).
- Live regions: the calculator headline (`aria-live="polite"`, the one live region of the calculator, so a screen reader hears each change), the splitter figures, the reverse result, and `role="status"` for copy and share messages. The import error is `role="alert"`.
- Every input has a visible label and is linked to its help text. Number fields use `inputmode="decimal"` (or `numeric` for whole numbers).
- Touch targets: buttons and the main controls have a minimum height or width of 2.75 rem (44 px).
- Current items are marked with `aria-current` (navigation), `aria-pressed` (language and chips), `aria-expanded` (the "Více" menu). The swipe comparison on phones is a focusable region with a label.
- Colour is never the only signal: the split bar has a text row for each part, and the badges have words.

## Testing layers

| Layer | Tool | Where | What it checks |
| --- | --- | --- | --- |
| Calculators | Vitest (Node) | `src/calc/*.test.ts` | Formulas; fixtures from the reference library (`fixtures/*.json`) |
| Law tests | Vitest | `src/calc/*.law.test.ts`, `osvc-regimes.test.ts` | Rules written from the statute text in `docs/legal-research/` |
| Year data | Vitest | `src/data/tax-years.test.ts` | Derivation check: values that follow from the average wage, minimum bases, sickness threshold |
| Model | Vitest | `src/model/*.test.ts` | PRD parity fixtures for 2024–2027, PRD edge cases, overrides, warnings, reverse search |
| State | Vitest | `src/state/*.test.ts` | Schema normalising, storage failures, share links, export and import |
| Components | Vitest + happy-dom + `@testing-library/preact` | `src/**/*.test.tsx` | Screens, forms, router, notices, toasts |
| Tools | Vitest | `tools/esbirka.test.ts` | The e-Sbírka helper |
| End to end | Playwright | `e2e/*.spec.ts` | Chromium (desktop) and Pixel 7 (phone) against the production build |
| Quality | Lighthouse | `scripts/lighthouse.ts` | Performance and accessibility gate |

CI (`deploy.yml`) runs typecheck, the unit tests, the build, the end-to-end tests and the Lighthouse gate on every push to `main`, and publishes `dist/` only when they pass.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server |
| `pnpm test`, `pnpm test:watch` | Vitest, all suites or in watch mode |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm build`, `pnpm preview` | Production build into `dist/`, and a local server for it |
| `pnpm e2e` | Playwright; builds and serves the app itself |
| `pnpm lighthouse` | Lighthouse against a running preview on port 4173 |
| `pnpm icons` | Renders the PWA icons from `public/favicon.svg` |
| `pnpm esbirka <path>` | Downloads an act from e-Sbírka as it reads on a date |
