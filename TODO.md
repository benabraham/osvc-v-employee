# TODO

Tick items with `- [x]` when done; nest sub-tasks with two-space indentation. Background for each area is in `docs/prd.md` and `docs/legal-research/`.

## 2027 values (due when published, usually December 2026)

- [ ] Compare the 2027 figures from the agencies with the values derived from the 2027 law
  - [ ] VZP: minimum ZP base 25 831,50 Kč and advance 3 488 Kč
  - [ ] ČSSZ: minimum SP base 18 083 Kč / advance 5 281 Kč, new OSVČ 12 916 / 3 772 Kč, maximum base 2 479 824 Kč, sickness threshold 5 000 Kč, minimum sickness premium 270 Kč
  - [ ] Finanční správa: paušální daň bands 9 661 / 16 745 / 27 139 Kč, band 1 with surcharge 11 061 Kč, 23 % threshold 1 859 868 Kč
  - [ ] Band 1: the press reports 9 662 Kč (15 % added to the premium), the law gives 9 661 Kč (15 % added to the base); follow Finanční správa's figure when published (docs/legal-research/2027.md)
  - [x] Press figures for the ZP and SP minimums, new OSVČ and sickness premium match the derived values (4 November 2026)
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
- [x] Turn official worked examples (Finanční správa, ČSSZ guidance, tax return and Přehled instructions) into test cases: 17 examples in src/calc/official-examples.test.ts, 14 pass (docs/legal-research/official-examples.md)
  - [ ] Decide: OSVČ base from the sickness premium rounds up (library, 99 library tests) while ČSSZ's Příklad č. 2 rounds down (440 Kč → 16 296 Kč); the benefit is the same in the example
  - [ ] Decide: benefits for a partial reference period (ČSSZ Příklad č. 1 and 3 divide by insured days, the app assumes 12 months over 365 days)
  - [ ] No official worked example found for maternity, the employee tax advance (post-2024) or the child bonus; add one when published
- [x] Second official source for the minimum wage, band 2 and the credits for every year (docs/legal-research/year-values.md, "Two-source check"; found the 30 % donation cap for 2022–2026)
  - [ ] Still one source: employee rates for 2024 and 2025 (VZP pages show the current year only), the 2027 average wage, bands 2–3 and the 2027 credits (until the agencies publish)
  - [ ] Values without an explicit status count as verified; review socialMinimumShare, sicknessEligibilityThreshold, reductionThresholds, sicknessInsuranceRatePercent for two sources

## Source spreadsheets

- [x] Fix known issues 9–14 in the 2024–2026 year sheets (docs/sheet-fixes.md; issue 12 needs a manual Apps Script edit)
  - [x] 9: SP share of profit 55 % in the 2025 and 2026 sheets
  - [x] 10: 2024 minimum SP base 158 292 Kč (131 904 Kč only for a new OSVČ)
  - [x] 11: 2025 minimum wage 20 800 Kč
  - [ ] 12: employee social rate 7.1 % in the gross estimate: lives in the bound Apps Script (estimateGrossWage) of the 2024 and 2025 sheets, which the Sheets API cannot edit; change it in Extensions → Apps Script
  - [x] 13: round the tax base down to hundreds
  - [x] 14: 23 % rate above 36 × the average wage

## App (PRD "Scope")

- [x] Choose and scaffold the front-end stack (Vite 8, Preact 11 + Signals, vite-plugin-pwa; see docs/architecture.md)
- [x] Calculator screen: inputs → net income, levies, gross equivalent
- [x] Invoice splitter as the default screen
- [x] Costs list with amortisation
- [x] Paušální daň comparison hint
- [x] Overrides with reset (tax-deductible costs, total levies)
- [x] Range warnings (above 1.5M Kč, below minimum wage, paušální daň above its band)
- [x] Reverse calculation: target net → hourly rate
- [x] Named scenarios and comparison
- [x] Share my calculation (inputs in the URL) and share app
- [x] Export and import (JSON)
- [x] Tax year switcher with own numbers for a year without data, and input sync across years
- [x] Itemised credits and deductions in the UI, including the 2027 credits
- [x] Benefits view: sickness, maternity and paternity for OSVČ vs employee, with eligibility
- [x] Czech and English UI
- [x] Install, offline and local persistence; Lighthouse targets
- [x] Deploy to GitHub Pages; disclaimer, links to the year sheets and to GitHub issues

- [ ] Follow-ups from the first QA and documentation pass (fixed: stale focused field after a year switch, desktop sidebar scrolling away, year-on-year with different default working days, toasts over controls, 360 px overflow, benefit citations, stored year outside the window)
  - [ ] Check on a real phone: swipe between scenario cards, the native year picker, install and offline
  - [ ] Scenarios and the year-on-year change use official data only; use the user's own numbers when they are switched on for that year
  - [ ] sicknessBands sums unrounded bands; § 21 odst. 2 rounds each band to two decimals first (no input found where it matters yet)
  - [ ] PRD notes to update in the Claude Doc: union dues and exam deductions abolished from 2024; SP base capped at 48 × the average wage; the gross search scans back 400 Kč after bisection; English app name "Freelancer vs. employee"; two-source status of 2024–2026 values

## Delivery

- [ ] Dogfood for 2 weeks with no fallback to the sheet
- [x] Make the repository public under MIT when ready (public as of 5 November 2026)
- [x] Write down the yearly upkeep (January window move, verification of new values): docs/maintenance.md
