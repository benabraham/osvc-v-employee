# TODO

Tick items with `- [x]` when done; nest sub-tasks with two-space indentation. Background for each area is in `docs/prd.md` and `docs/legal-research/`.

## 2027 values (due when published, usually December 2026)

- [ ] Compare the 2027 figures from the agencies with the values derived from the 2027 law
  - [ ] VZP: minimum ZP base 25 831,50 Kč and advance 3 488 Kč
  - [ ] ČSSZ: minimum SP base 18 083 Kč / advance 5 281 Kč, new OSVČ 12 916 / 3 772 Kč, maximum base 2 479 824 Kč, sickness threshold 5 000 Kč, minimum sickness premium 270 Kč
  - [ ] Finanční správa: paušální daň bands 9 661 / 16 745 / 27 139 Kč, band 1 with surcharge 11 061 Kč, 23 % threshold 1 859 868 Kč
  - [ ] If band 1 differs from 9 661 Kč, recheck the rounding order in `calculatePausalniDanMonthlyAmounts`
- [ ] Add the published links to `docs/legal-research/year-values.md` and the published numbers to the 2027 tests in `src/calc/osvc-regimes.test.ts`
- [ ] Add the 2028 slot each January: average wage from the new nařízení vlády, minimum wage from MPSV, act wordings from e-Sbírka (`pnpm esbirka /sb/1992/589/2028-01-01 --find …`)

## Calculations not modelled yet

- [x] Doubled spouse credit when the spouse holds a ZTP/P card (zákon 586/1992 Sb. § 35bb odst. 1)
- [x] Doubled child credit for a child with a ZTP/P card (§ 35c odst. 7)
- [x] Mortgage interest prorated by month when paid for part of the year (§ 15 odst. 4)
- [ ] Open questions from the ZTP/P and mortgage work (see docs/legal-research/income-tax.md)
  - [ ] Is the 300 000 Kč pre-2021 mortgage cap prorated by month like the 150 000 Kč one?
  - [ ] Maximum child bonus: § 35c odst. 7 refers to a maximum in odst. 3 that the 2026 wording no longer states
  - [ ] Employee spouse credit is claimed only in the yearly settlement, so the monthly gross equivalent leaves it out; decide whether to show a note
- [ ] Eligibility check for the 2027 paušální daň surcharge (band 1, previous-year income up to 1 000 000 Kč, § 2b)
- [x] Yearly tax data module: one `rates` object per tax year (2024–2027) built from `year-values.md`, so the app no longer needs fixtures for rates
  - [x] Each value carries its source and a status (researched / verified), as the PRD asks
  - [x] Derivation check in CI: minimum bases, thresholds and paušální daň recomputed from the average wage

## Verification (PRD "Value verification")

- [ ] Payroll cross-check of the gross salary against an independent payroll calculator, at least three gross amounts per year, one above the 23 % threshold
- [ ] Turn official worked examples (Finanční správa, ČSSZ guidance, tax return and Přehled instructions) into test cases
- [ ] Second official source for the minimum wage, band 2 and the credits for every year

## Source spreadsheets

- [ ] Fix known issues 9–14 in the 2024–2026 year sheets
  - [ ] 9: SP share of profit 55 % in the 2025 and 2026 sheets
  - [ ] 10: 2024 minimum SP base 158 292 Kč (131 904 Kč only for a new OSVČ)
  - [ ] 11: 2025 minimum wage 20 800 Kč
  - [ ] 12: employee social rate 7.1 % in the gross estimate
  - [ ] 13: round the tax base down to hundreds
  - [ ] 14: 23 % rate above 36 × the average wage

## App (PRD "Scope")

- [ ] Choose and scaffold the front-end stack (PWA, offline, Baseline 2024)
- [ ] Calculator screen: inputs → net income, levies, gross equivalent
- [ ] Invoice splitter as the default screen
- [ ] Costs list with amortisation
- [ ] Paušální daň comparison hint
- [ ] Overrides with reset (tax-deductible costs, total levies)
- [ ] Range warnings (above 1.5M Kč, below minimum wage, paušální daň above its band)
- [ ] Reverse calculation: target net → hourly rate
- [ ] Named scenarios and comparison
- [ ] Share my calculation (inputs in the URL) and share app
- [ ] Export and import (JSON)
- [ ] Tax year switcher with own numbers for a year without data, and input sync across years
- [ ] Itemised credits and deductions in the UI, including the 2027 credits
- [ ] Benefits view: sickness, maternity and paternity for OSVČ vs employee, with eligibility
- [ ] Czech and English UI
- [ ] Install, offline and local persistence; Lighthouse targets
- [ ] Deploy to GitHub Pages; disclaimer, links to the year sheets and to GitHub issues

## Delivery

- [ ] Dogfood for 2 weeks with no fallback to the sheet
- [ ] Make the repository public under MIT when ready
- [ ] Write down the yearly upkeep (January window move, verification of new values)
