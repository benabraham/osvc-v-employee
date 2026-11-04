# OSVČ vs. zaměstnanec

An offline-first web app for Czech freelancers (OSVČ). It answers two questions:

1. **What employee salary does my invoicing really equal?** It turns the net income of a freelancer into the gross salary of an employee with the same net pay, using the year's tax, insurance and payroll rules.
2. **How should I split each invoice I send?** It shows how much of an invoice goes to levies, costs, a reserve and holiday, and what is left to spend.

The app is a replacement for the author's spreadsheet *OSVČ v. zaměstnanec 2026*. It runs in the browser, works offline after the first visit and keeps all data on the device.

**Live app:** https://benabraham.github.io/osvc-v-employee/

> The results are an estimate, not tax advice. Check important decisions with a tax adviser.

## Features

- **Calculator:** inputs (working days, hours, hourly rate, expense rate, costs, credits) to net income per year and month, levies, and the gross salary equivalent.
- **Invoice splitter:** the default screen once set up. Split one invoice into levies, costs, reserve, holiday and what you can spend.
- **Costs:** a list of business costs, each spread over its amortisation months.
- **Paušální daň hint:** one line that says whether the flat-rate tax would save or cost you money, and how much a year.
- **Overrides:** replace the calculated tax-deductible costs or total levies with your own figures, and reset them with one tap.
- **Warnings:** shown inline, never blocking: invoicing above 1.5 million Kč, a gross salary below the minimum wage, paušální daň above its band, a child credit that cannot be paid as a bonus.
- **Reverse calculation:** a target net monthly income gives the hourly rate you need.
- **Scenarios:** save named calculations (for example 650 vs. 800 Kč/h) and compare them side by side, or swipe through them on a phone.
- **Share link:** a link that carries your inputs and tax year, nothing else.
- **Share app:** the system share sheet, or a copied link where sharing is not available.
- **Export and import:** a JSON backup of all data, to move to another device.
- **Expense rates:** 30, 40, 60 and 80 %; the paušální daň band limits follow the rate.
- **Tax years 2024–2027:** the two previous years, the current year and the next. A year without official values shows a notice and lets you enter your own figures.
- **Sync across years:** an option to share one set of inputs between all years.
- **Credits and deductions:** itemised, with their caps, including the credits that return in 2027 (student, preschool fees, first year with registered sales).
- **Benefits comparison:** sickness, maternity and paternity benefit for an employee and an OSVČ, with eligibility.
- **Czech and English:** the interface is in Czech by default; switch to English in the header.
- **Offline PWA:** installable on Android, iOS and desktop; works offline; offers a reload when a new version is ready.
- **Light and dark theme:** follows the system by default.

## Privacy

- No server, no account, no analytics, no trackers and no cookies.
- All data is stored in the browser's `localStorage` on your device. Nothing is sent anywhere.
- A share link keeps its data in the part of the URL after `#`, which the browser does not send to a server. It carries only the year and the inputs that differ from the defaults.
- GitHub Pages serves the app's files, so GitHub sees ordinary web requests, as with any static site.

## Tech stack

- [Vite 8](https://vite.dev) with [Preact 11](https://preactjs.com) and [@preact/signals](https://preactjs.com/guide/v10/signals/) for state
- TypeScript 7 (strict), no CSS framework (plain CSS with custom properties and native nesting)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app) (Workbox) for the service worker and the manifest
- [Vitest 5](https://vitest.dev) with happy-dom and [@testing-library/preact](https://testing-library.com/docs/preact-testing-library/intro/)
- [Playwright](https://playwright.dev) for end-to-end tests, [Lighthouse](https://developer.chrome.com/docs/lighthouse) for the quality gate
- pnpm 10 and Node 22 or newer

## Getting started

```bash
pnpm install
pnpm dev                 # development server, http://localhost:5173/osvc-v-employee/
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Starts the Vite development server |
| `pnpm test` | Runs all unit and component tests once (`pnpm test:watch` keeps them running) |
| `pnpm typecheck` | Type-checks the project with `tsc --noEmit` |
| `pnpm build` | Builds the production app into `dist/`, with the service worker |
| `pnpm preview` | Serves `dist/` locally, as GitHub Pages would |
| `pnpm e2e` | Runs the Playwright tests on desktop Chromium and Pixel 7; it builds and serves the app itself. The first time, run `pnpm exec playwright install chromium` |
| `pnpm lighthouse` | Runs Lighthouse on a running preview (`pnpm build && pnpm preview --port 4173 --strictPort` first) |
| `pnpm icons` | Renders the PWA icons from `public/favicon.svg` |
| `pnpm esbirka <path>` | Downloads a Czech act from e-Sbírka as it reads on a date, for example `pnpm esbirka /sb/1992/589/2027-01-01 --find "35 %"` |

The app is written in TypeScript, without classes, with arrow functions and no semicolons. See `docs/architecture.md` for the layers.

## Project layout

| Path | What is there |
| --- | --- |
| `src/calc/` | Pure calculators from the law: income tax, health and social insurance, paušální daň, payroll, benefits, gross from net |
| `src/calc/fixtures/` | Frozen test cases exported from the reference library |
| `src/data/` | Yearly tax data for 2024–2027, each value with its sources and status (`tax-years.ts`) |
| `src/model/` | `Inputs` → `Results`: the whole pipeline for one year, reverse search, costs, year-on-year change |
| `src/state/` | The app store (Preact signals), the versioned state in `localStorage`, share links, export and import |
| `src/i18n/` | Czech and English messages, one file per feature, and money and number formatting |
| `src/app/` | The shell: header, navigation, routing, footer, year notices, service worker prompt |
| `src/ui/` | Shared form and result components |
| `src/screens/` | One folder per screen: `split`, `calc`, `costs`, `scenarios`, `reverse`, `benefits`, `data`, `about` |
| `src/styles/` | Global styles |
| `e2e/` | Playwright end-to-end tests |
| `tools/` | `esbirka.ts`, which downloads an act from e-Sbírka |
| `scripts/` | `render-icons.ts` and `lighthouse.ts` |
| `public/` | Icons, favicon, `robots.txt` |
| `docs/` | Product spec, architecture, legal research, user guide, yearly maintenance |
| `.github/workflows/` | `deploy.yml`: test, build and deploy |

The author's private Python tax library, from which the calculations were ported, is not part of this repository. Its test cases are kept as frozen JSON fixtures in `src/calc/fixtures/`.

## Testing

- **Unit tests from the statutes.** `src/calc/*.law.test.ts` and `osvc-regimes.test.ts` test each rule against the statute text quoted in `docs/legal-research/`.
- **Fixtures from the reference library.** `src/calc/fixtures/*.json` hold two kinds of cases: the library's own test cases and cases it generated for chosen inputs. The calculators are tested against them.
- **PRD parity fixtures.** `src/model/compute.test.ts` checks every output of the product spec for the 2026 defaults, the four tax years (2024–2027) and the edge cases (for example 1 000 Kč an hour, three children, paušální daň, overrides).
- **Year-data derivation.** `src/data/tax-years.test.ts` recomputes the values that follow from the average wage (minimum bases, paušální daň bands, reduction thresholds) and must match.
- **Component tests.** Screens, forms, the router and the notices are tested with happy-dom and `@testing-library/preact`. Such a file starts with `// @vitest-environment happy-dom`.
- **End-to-end tests.** `e2e/*.spec.ts` run the production build in desktop Chromium and on a Pixel 7 emulation.
- **Quality gate.** Lighthouse must report performance of at least 95 and accessibility of 100.

Run the checks the way CI does:

```bash
pnpm typecheck && pnpm test && pnpm build && pnpm e2e
```

For the Lighthouse gate, start the preview in one terminal and run the check in another:

```bash
pnpm build && pnpm preview --port 4173 --strictPort   # terminal 1
pnpm lighthouse                                       # terminal 2
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`:

1. installs the dependencies from the lockfile and runs `pnpm typecheck` and `pnpm test`;
2. builds the app and runs the end-to-end tests on desktop and Pixel 7;
3. starts the preview server and runs the Lighthouse gate;
4. publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves. The branch is rebuilt from scratch on each deploy.

If a step fails, nothing is published. A deploy that is already running is not cancelled by a newer push; the newest waiting run takes its turn.

## Documentation

| Document | What it covers |
| --- | --- |
| [docs/prd.md](docs/prd.md) | Product requirements: goals, scope, rules, values, known issues of the source spreadsheet |
| [docs/architecture.md](docs/architecture.md) | Layers, routes, state, share links, PWA, testing layers, budgets |
| [docs/user-guide.md](docs/user-guide.md) | How to use each screen (in Czech, with an English summary) |
| [docs/maintenance.md](docs/maintenance.md) | Yearly upkeep: adding a tax year, verification, release checklist |
| [docs/calc-port-notes.md](docs/calc-port-notes.md) | What was ported from the reference library, what changed, and why |
| [docs/legal-research/](docs/legal-research/README.md) | Statute quotes, the official amounts for each year, and the code and tests that implement each rule |

## Reporting issues

Report a bug or suggest a change as an issue: https://github.com/benabraham/osvc-v-employee/issues. The app has no official support beyond the issue tracker.

## Licence

MIT. Copyright (c) 2026 Daniel Srb. See [LICENSE](LICENSE).

The author is Dan Srb. The app is based on his spreadsheet, [OSVČ v. zaměstnanec 2026](https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s), and on his [video on YouTube](https://www.youtube.com/watch?v=iJGjTFDYw9A).
