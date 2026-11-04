# OSVČ vs. zaměstnanec

Offline-first PWA that compares Czech self-employed (OSVČ) income with an employee salary and splits invoices. The product spec is `docs/prd.md` (an export of the Claude Doc linked at its top). Open work is in [TODO.md](TODO.md): read it at the start, tick items as they are done, and add new ones as nested `- [ ]` tasks.

## Commands

```bash
pnpm install
pnpm test          # vitest, all suites
pnpm test:watch
pnpm typecheck     # tsc --noEmit
```

## Layout

- `src/calc/` pure calculators, imported through `src/calc/index.ts`
  - each takes its inputs plus one year's `rates` object (RORO) and returns every intermediate value
  - `*.test.ts` next to each module; `*.law.test.ts` holds tests written from the statutes
  - `fixtures/*.json` cases exported from the reference Python library (`library-test` = its own tests, `generated` = its output for chosen inputs)
- `docs/legal-research/` word-for-word statute quotes, the official source of every year value, and which function and test implement each rule
- `docs/calc-port-notes.md` what was ported, what changed against the library, and why
- `reference/` git-ignored: Dan's private Python tax library and the fixture generator; never commit it or any Python file

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

## Git

- Commit and push to `main` freely; descriptive messages that say what changed and why.
