# OSVČ vs. zaměstnanec

Offline-first PWA that compares Czech self-employed (OSVČ) income with an employee salary and splits invoices. The product spec is `docs/prd.md` (an export of the Claude Doc linked at its top). Open work is in [TODO.md](TODO.md): read it at the start, tick items as they are done, and add new ones as nested `- [ ]` tasks.

## Commands

```bash
pnpm install
pnpm dev           # Vite dev server
pnpm test          # vitest, all suites (calculations in Node, UI with happy-dom)
pnpm test:watch
pnpm typecheck     # tsc --noEmit
pnpm build         # production build with the service worker, into dist/
pnpm preview       # serve dist/ at /osvc-v-employee/
pnpm e2e           # Playwright on desktop and Pixel 7 (builds and previews itself)
pnpm lighthouse    # needs pnpm preview --port 4173; fails below performance 95 or accessibility 100
pnpm icons         # re-render the PNG icons from public/favicon.svg
pnpm esbirka /sb/<year>/<number>/<YYYY-MM-DD> [--out file.txt] [--find "phrase"]
```

## Layout

- App layers in order: `src/calc` → `src/data` (yearly tax data) → `src/model` (Inputs → Results) → `src/state` (signals store, persistence, sharing) → `src/i18n` → `src/ui` (shared components) → `src/app` (shell, routing, PWA) → `src/screens/<route>`; details in `docs/architecture.md`
- `src/calc/` pure calculators, imported through `src/calc/index.ts`
  - each takes its inputs plus one year's `rates` object (RORO) and returns every intermediate value
  - `*.test.ts` next to each module; `*.law.test.ts` holds tests written from the statutes
  - `fixtures/*.json` cases exported from the reference Python library (`library-test` = its own tests, `generated` = its output for chosen inputs)
- `docs/legal-research/` word-for-word statute quotes, the official source of every year value, and which function and test implement each rule
- `docs/calc-port-notes.md` what was ported, what changed against the library, and why
- `tools/esbirka.ts` downloads any act from the official e-Sbírka as it reads on a date (`pnpm esbirka /sb/1992/589/2027-01-01 --find "35 %"`); use it to quote and check the law
- No Python in this repository: Dan's private tax library and anything that runs it stay outside (`/reference/` is git-ignored in case it is copied in again). The fixtures are a frozen export of it

## Rules for calculations

- Test first: write the failing test, then the code. Run `pnpm test` and `pnpm typecheck` before committing.
- Every rate, cap or threshold comes from the law or an official publication (e-Sbírka, zakonyprolidi.cz, Finanční správa, ČSSZ, VZP, MPSV, nařízení vlády). Quote it in `docs/legal-research/` and list year values in `year-values.md` with their source. Commercial sites are not sources.
- Where the law and the reference library or the year sheets disagree, the law wins; record the difference in `docs/calc-port-notes.md`.
- Year data is keyed by the real tax year. The library's `CALC_N` mixes employee year N with OSVČ settlement year N−1.
- Rounding: `roundHalfAwayFromZero` (ties away from zero, like Sheets and the library's Python 2 `round`); premiums and bases round up where the act says so.
- Keep operation order identical to the formula being ported; floating-point results depend on it.

## Code style

- TypeScript, functional and declarative, no classes; arrow functions, no semicolons, template literals.
- RORO for two or more parameters; guard clauses first, happy path last.
- Descriptive English names (`isNewOsvc`, `minimumSocialMonthlyBase`), never the library's Czech or abbreviated keys.
- JSDoc on every exported function with the legal reference (act, §, odst.).
- Lowercase-dash file and directory names.
- Browser support target: Baseline 2024 (see the PRD).

## Decisions so far

- The PRD's source of truth is the Claude Doc linked at the top of `docs/prd.md`; after editing it, refresh the export in `docs/prd.md`.
- Scope of the calculations: everything that changes the OSVČ vs. employee comparison (tax, insurance, paušální daň, benefits and eligibility, gross equivalent, the PRD plan). Pensions are left out on purpose; the app only says OSVČ pensions are lower.
- The law wins over Dan's Python library and the year sheets; known sheet issues are listed in the PRD and in `TODO.md`.
- 2024–2026 values are verified against the official texts and agency figures; 2027 values follow from the 2027 wording in e-Sbírka and nařízení vlády 177/2026 Sb. and must be compared with the agencies' figures once published (see `TODO.md`).
- Calculations are TypeScript (as the PRD says). The app is Vite 8 + Preact 11 with Signals and vite-plugin-pwa, plain CSS with native nesting (no framework) to stay under 50 KB of initial JS; screens other than the splitter and the calculator load lazily.
- The app is deployed by `.github/workflows/deploy.yml` (typecheck, unit, e2e, Lighthouse, then the gh-pages branch) to https://benabraham.github.io/osvc-v-employee/.
- UI text lives in one message bundle per feature (`src/i18n/messages/<feature>.ts`, Czech first, English complete); never hard-code user-visible strings.
- The repository is private on GitHub (`benabraham/osvc-v-employee`), MIT-licensed; it goes public at delivery.

## Git

- Commit and push to `main` freely; descriptive messages that say what changed and why.
- Commits are authored as `Claude <noreply@anthropic.com>` (a session hook checks this).
