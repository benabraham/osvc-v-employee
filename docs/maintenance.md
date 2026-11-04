# Maintenance

What has to change each year so the app stays correct, how the tax-year window moves by itself, and what users see when a year has no data yet. The product rules behind this are in `docs/prd.md` ("Tax constants and maintenance", "Value verification", "Tax years").

Each tax year is a data change, not a code change. A new year needs one new entry in `src/data/tax-years.ts`, its tests and its research notes. The calculators do not change.

## What the yearly upkeep covers

| Item | Where it lives | Where the number comes from |
| --- | --- | --- |
| Average wage, general assessment base, conversion coefficient | `averageWage`, `generalAssessmentBase`, `conversionCoefficient` | The government regulation (nařízení vlády) on the average wage for the year, § 1 odst. 1 and 2. It is published in the autumn before the year. |
| Minimum wage | `minimumWage` | MPSV, the ministry of labour. Use the regulation it cites. |
| Minimum social base (SP) and its share | `socialMinimumShare`, `newOsvcSocialMinimumShare` | Zákon 589/1992 Sb. § 14 odst. 5 (the share of the average wage), ČSSZ for the published minimum base and advance |
| Share of profit for SP | `socialProfitShare` | Zákon 589/1992 Sb. § 5b (55 % for 2024–2027) |
| Minimum health base (ZP) | derived from `averageWage` | Zákon 592/1992 Sb. § 3a odst. 2 (twelve times 50 % of the average wage); VZP publishes the base and the advance |
| Paušální daň bands 1–2 (band 3 is not in the form) | `pausalniDanMonthly` | Finanční správa, the page on paušální daň for the year |
| Surcharge for no sales registration (2027+) | `salesRegistrationSurcharge` | Zákon 586/1992 Sb. § 2b |
| Eligibility threshold for sickness insurance | `sicknessEligibilityThreshold` | Zákon 187/2006 Sb. § 6 odst. 2 (the ministry announces the amount in the Sbírka) |
| OSVČ sickness insurance rate | `sicknessInsuranceRatePercent` | Zákon 589/1992 Sb. § 3 and § 5b odst. 4 (see `docs/calc-port-notes.md`) |
| Benefit reduction thresholds | `reductionThresholds` | Zákon 187/2006 Sb. § 22 (derived, see below) |
| Income tax rates, credits and caps | `incomeTax` | Zákon 586/1992 Sb. §§ 15, 16, 35ba–35c; new credits from the act that introduces them (zákon 180/2026 Sb. for 2027) |
| Working days | `workingDays` | The default number of working days for the year (the year sheet for past years). No statute sets it. |
| Employee rates | `employee` | Zákon 592/1992 Sb. (health 4.5 %), zákon 589/1992 Sb. (social 7.1 %; 2024 had 6.5 % plus 0.6 % sickness) |

Year data is keyed by the real tax year. The reference library's `CALC_N` mixes employee year N with the OSVČ settlement of year N−1; the app never does that. Every value of the year `2028` is the value that applies in 2028.

## The yearly cycle

The steps below are for a new year, here 2028, which the window shows as "next" from January 2027. Start in November or December, when the agencies publish. Finish before the year starts, so the year has data when it becomes the current one.

### 1. Read the new wording of the acts

Use the official e-Sbírka text, as it reads on the date that matters:

```bash
pnpm esbirka /sb/1992/589/2028-01-01 --find "35 %"      # social insurance
pnpm esbirka /sb/1992/586/2028-01-01 --find "slev"      # income tax and credits
pnpm esbirka /sb/2006/187/2028-01-01 --find "rozhodný příjem"  # sickness insurance
pnpm esbirka /sb/2026/177/2026-11-04                    # the regulation on the 2027 average wage, as an example
```

Use `--out <file>` to save the whole act to a file outside the repository, and search that file. The path is the act's ELI path without the `/eli/cz` prefix.

### 2. Add the year to `src/data/tax-years.ts`

Add an entry to `TAX_YEARS` with every field of `TaxYearData`:

| Field | What to put in it |
| --- | --- |
| `year`, `validFrom` | The tax year and the first day its values apply (`'2028-01-01'`). One set of values covers the whole year, even after a mid-year change. |
| `workingDays` | The working-day default for the year |
| `generalAssessmentBase`, `conversionCoefficient` | From the regulation on the average wage (its § 1 odst. 1 and 2) |
| `averageWage` | The product of the two above, rounded up. The derivation test checks it. |
| `minimumWage` | From MPSV |
| `socialMinimumShare` | 0.35 or 0.30, as the act says for the year |
| `newOsvcSocialMinimumShare` | 0.25 (a new OSVČ in the start year and the next two) |
| `socialProfitShare` | 0.55 |
| `pausalniDanMonthly` | `[band 1, band 2, band 3]` in Kč a month, from Finanční správa |
| `salesRegistrationSurcharge` | Only from 2027: the band 1 surcharge. Leave it out for years without it. |
| `sicknessEligibilityThreshold` | From the ministry's announcement. The act raises it when one tenth of the general base × coefficient, rounded down to 500 Kč, is higher than the current amount (zákon 187/2006 Sb. § 6 odst. 2). |
| `sicknessInsuranceRatePercent` | 2.7 |
| `reductionThresholds` | Three numbers: one thirtieth of the general base × coefficient (rounded up), × 1.5, × 3 (rounded up). The 2027 entry has a comment with the arithmetic. |
| `incomeTax` | The rates, credits and caps of the year. Copy `COMMON_INCOME_TAX` and change only what the act changes. Add `studentCredit`, `salesRegistrationCredit` and `childPlacementCreditCapIsMinimumWage` only in years that have them. |
| `employee` | Health and social rates; `sicknessRate` only in 2024; `socialRateRetired` from 2026; the employer's social rate |
| `status` | `{}` for values that are verified; otherwise `{ key: 'researched' }` (see step 4) |
| `sources` | `{ key: [{ label, url }] }`: at least the act or regulation for each key, plus the agency page |

Use the same keys and the same style as the 2027 entry. The code is documented in `src/data/tax-years.ts`.

### 3. Run the derivation check

```bash
pnpm test -- src/data
```

`src/data/tax-years.test.ts` runs a `describe.each` over every year, so the new year is checked automatically:

- the average wage equals the general base × coefficient, rounded up;
- the paušální daň bands follow from the average wage and the share (`calculatePausalniDanMonthlyAmounts`);
- the reduction thresholds follow the § 22 formula;
- the sickness threshold does not fall.

Some tests list years by hand, so add a row for the new year:

- the table `minimum bases against the published figures` (ZP base, SP base, new OSVČ SP base, 23 % threshold);
- the `buildYearRates` tests, if the year should keep the employee or income-tax fixture checks;
- the window tests, if they name the next year.

Do not change the expected values to make a test pass. A failing derivation means either the entry or the formula is wrong.

### 4. Set the status and the sources

- Each value needs a source. The PRD requires two sources, preferably official (step 7).
- A value that the agencies have not published yet, but that follows from the act, is `researched`. The app shows it with the "z textu zákona" label and the "neověřeno" badge.
- A value with one source only, or one that is still to be compared, stays `researched` until the second source is in.
- A value that a user has entered is `custom`. The app sets that itself.
- Status `verified` is the default for values not listed in `status`. Do not rely on the default for a new year: list every value that is not yet confirmed.

### 5. Add the parity fixture

In `src/model/compute.test.ts`, add an entry to the `yearCases` array of `describe('computeResults: the four tax years of the PRD table')`:

```ts
{
  year: 2028,
  changes: { hourlyRate: 650, workingDays: 252 },   // the inputs of the year's sheet, or the 2026 defaults for a forecast
  expected: {
    invoiced: …, incomeTax: …, healthInsurance: …, socialInsurance: …, totalLevies: …,
    netMonthly: …, grossWage: …, split: [levies, costs, reserve, holiday, spend],
  },
},
```

Where do the expected values come from? Not from the app. The PRD asks that each year's fixture match its sheet, and that a value is checked twice. Take them from the year's sheet, or work them out by hand from the PRD's calculation rules, then check them against a second source. The 2027 fixture uses the 2026 default inputs with the 2027 constants, so it is a forecast check.

Also add the edge cases the PRD lists when the year changes the rules, such as a new credit or a new band rule.

### 6. Update the research notes

- `docs/legal-research/year-values.md`: add a column or a row for the year, with the publication and its link. Note any difference between the act and the agency figure.
- If the act's wording changed, add a note file in the pattern of `docs/legal-research/2027.md`, with the new wording quoted word for word and the version it was read from.
- `docs/calc-port-notes.md`: only if a rule changed, not just a value.

### 7. Verify with a second source

PRD "Value verification" applies to every new value:

1. Primary source: the act, the regulation, or the official page of Finanční správa, ČSSZ, VZP or MPSV.
2. Second source: a second source states the same number. Prefer another official one (for example the regulation and the ČSSZ page). A professional publication counts only when no official second source exists. A value with one source stays `researched`.
3. Derivation check: step 3.
4. Output check: the parity fixture (step 5), and the payroll cross-check and the official worked examples where the TODO list still has them open.
5. Fresh eyes: someone who did not enter the values re-derives them from the sources before release. This can be a person or a separate AI agent.

### 8. Release

1. Run `pnpm typecheck` and `pnpm test`. Run `pnpm build` and `pnpm e2e` too, or let CI do it.
2. Commit to `main` with a message that says what changed and why. Follow `CLAUDE.md` for the git rules.
3. Push. `.github/workflows/deploy.yml` runs typecheck, tests, build, end-to-end, the Lighthouse gate, and publishes to GitHub Pages.
4. Open the live app after the deploy. Check the footer ("Hodnoty platné od …"), the year switcher and the About screen's sources for the new year.
5. Tick the matching items in `TODO.md`.

The PRD asks that new official values are live within seven days of the change.

## How the window moves

- `taxYearWindow({ today })` in `src/data/tax-years.ts` returns `[current − 2, current − 1, current, current + 1]`. Today the window is 2024–2027.
- The store takes today's date once, when the app loads (`getAppStore` in `src/state/index.ts`). A tab that stays open across New Year keeps the old window until it is reloaded.
- On 1 January 2028 the window becomes 2026–2029 without a code change: 2024 and 2025 drop out, 2028 becomes the current year and 2029 becomes "next", with the notice until its data exists.
- Each January the new "next" year shows the notice until its values are added. The release that adds them is the normal yearly release.

Before a new year starts, add its data, so that the year is never "current" without values. The footer shows a warning when the current year has no data.

## What users see for a year without data

| Situation | What the user sees |
| --- | --- |
| Two past years, with data | The year is labelled "minulý rok" in the switcher. The footer says the values are from a past year and are for comparison. |
| Current year, with data | Labelled "aktuální". No notice. |
| Next year, with data | Labelled "příští". Everything works. |
| Next year, no data yet | Labelled "příští" and a notice: "Hodnoty pro {rok} doplníme co nejdříve." Two buttons: "Počkat na oficiální hodnoty" (opens the current year) and "Zadat vlastní hodnoty" (opens the form for the year's own numbers). |
| Current year, no data (should not happen) | The footer warns: "Pro aktuální rok {rok} zatím nejsou hodnoty, výsledky proto nejsou k dispozici." The calculator, the splitter, the reverse screen and the benefits screen show a short "no data" line. |
| Own numbers in use for a year | The header shows the "vlastní hodnoty" badge, and every result is marked the same way. The notice says official values will be added. |
| Official values published for a year that has own numbers | Once, a notice asks "Oficiální hodnoty pro {rok} jsou k dispozici. Přepnout na ně?" with "Ano, přepnout" and "Ne, nechat vlastní". The answer is kept for that year. |

The own-numbers form (`src/app/custom-year-form.tsx`) opens prefilled with the latest official year. It asks for the average wage, the minimum wage, the working days, paušální daň bands 1 and 2, the social minimum share, the payer credit and the three child credits. Every other value of the year stays as in the base the form started from, which is the latest official year the first time. Fields the user changes are marked `custom`.

## Mid-year changes

The PRD rule: one set of values applies to the whole year, including the months before the change.

- Change the year's entry in `TAX_YEARS`. Do not add a second entry for the same year.
- Give the source of the change (the act, its date, and the link), and make the status of the changed value match the state of the source.
- Keep the old value in a comment, as the 2026 entry does for the July 2026 change (zákon 90/2026 Sb.: minimum social base share 40 % → 35 %, band 1 9 984 → 9 162 Kč).
- Update the parity fixture for the year if its results change, and say in `year-values.md` why they changed.

## December 2026 to-do for 2027

From `TODO.md`. These items close when the agencies publish their 2027 figures (usually in December 2026).

- [ ] Compare the 2027 figures from the agencies with the values derived from the 2027 law:
  - VZP: minimum ZP base 25 831,50 Kč and advance 3 488 Kč;
  - ČSSZ: minimum SP base 18 083 Kč, advance 5 281 Kč; new OSVČ 12 916 Kč and 3 772 Kč; maximum base 2 479 824 Kč; sickness threshold 5 000 Kč; minimum sickness premium 270 Kč;
  - Finanční správa: paušální daň bands 9 661 / 16 745 / 27 139 Kč; band 1 with surcharge 11 061 Kč; 23 % threshold 1 859 868 Kč;
  - if band 1 differs from 9 661 Kč, recheck the rounding order in `calculatePausalniDanMonthly`.
- [ ] Add the published links to `docs/legal-research/year-values.md`, and the published numbers to the 2027 tests in `src/calc/osvc-regimes.test.ts`.
- [ ] Add the 2028 slot each January: average wage from the new regulation, minimum wage from MPSV, the act's wording from e-Sbírka (`pnpm esbirka /sb/1992/589/2028-01-01 --find …`).

The 2027 entry also has values that still need the agencies' figures. Child credits have no status yet, and the average wage and the minimum wage are marked `verified` by default. See the known gaps below.

## Known gaps to close in the yearly cycle

These come from reading the code while writing this guide. They are not fixed here.

1. **A stored year can fall out of the window.** The app keeps any valid year in the saved state (`normalizeState` accepts 2000–2100). The year is not reset when the window moves on. After 1 January 2027, a user whose saved year is 2024 keeps calculating 2024, but the year switcher has no option that matches it. The window should reset the active year when it leaves the window.
2. **Scenarios use only official values.** `resultsForScenario` in `src/screens/scenarios/scenario-results.ts` reads `TAX_YEARS` only. A scenario for a year that runs on the user's own numbers is therefore calculated with the official numbers of that year, or not at all. The current-calculation column of the same comparison does use the own numbers.
3. **The year-on-year change uses only official values.** `yearOnYearChange` in `src/app/context.ts` takes the previous year from `TAX_YEARS`.
4. **2027 statuses.** Only five 2027 values are marked `researched`. Working days, average wage, minimum wage, payer credit, child credits and the employee rates are `verified` by default, although the TODO list still asks for the agencies' figures. Mark them `researched` until the comparison is done. The 2027 average wage has one source in the data, while the PRD also cites Money.cz.
5. **Hand-written year lists in tests.** The derivation tests name the years by hand (see step 3). Forgetting a row does not fail the build, it only leaves the new year unchecked.
6. **No reminder in the repository.** The PRD suggests a December reminder. The repository has none; it must be set up outside the code.

## Release checklist

Use this list for every yearly release and for any mid-year change.

**Data and sources**

- [ ] The year's entry is in `TAX_YEARS`, with `validFrom`, `workingDays`, every rate and cap, `status` and `sources`.
- [ ] Every value that is not yet confirmed is listed in `status`, as `researched`.
- [ ] Every value has at least one source; the second source is in, or the value stays `researched`.
- [ ] The derivation check passes (`pnpm test -- src/data`).
- [ ] The years listed by hand in `tax-years.test.ts`, `osvc-regimes.test.ts` and `compute.test.ts` include the new year.
- [ ] The parity fixture for the year is in `compute.test.ts`, with expected values from the sheet or a hand calculation, not from the app.
- [ ] `docs/legal-research/year-values.md` has the year, its sources and any differences from the act.
- [ ] A fresh-eyes review has re-derived the new values from the sources.

**Code**

- [ ] `pnpm typecheck` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` and `pnpm e2e` pass, or CI has run them.
- [ ] `pnpm lighthouse` passes on the preview (performance 95 or more, accessibility 100).

**Release**

- [ ] Committed to `main` with a message that says what changed and why.
- [ ] The Actions run for the push is green, and the live app shows the new values: footer date, year switcher, About sources.
- [ ] `TODO.md` ticks are updated.
- [ ] The next year's slot is checked: its notice and its "Počkat" and "Zadat vlastní hodnoty" buttons still work.
