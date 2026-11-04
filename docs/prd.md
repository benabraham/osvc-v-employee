# OSVČ vs. zaměstnanec — PRD

Dan Srb · 30 Oct 2026 · Source of truth: [Claude Doc](https://claude.ai/artifact/CZ5AayDrMjFd5cdHs8zkFv); this file is an export.

## Overview

Build an installable, offline-first PWA that replaces Dan's own spreadsheet [OSVČ v. zaměstnanec 2026](https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s). It answers two questions for Czech freelancers: what employee salary does my invoicing really equal, and how should I split each invoice I send.

The sheet's logic is sound, but it is awkward in practice. Users must copy it before using it, and it is easy to break by editing the wrong cell. It is clumsy on a phone, and the gross-wage estimate only works after granting Apps Script permissions.

The source has 3 sheets: výpočet (calculation), náklady (costs), and konfigurace (yearly constants). Together they hold about 60 named ranges, chained in one direction with no circular references. That makes a faithful port low-risk.

## Goals and non-goals

The app must match the sheet to the koruna for 2026, then beat it on usability. It is not an accounting tool.

**Goals**

- **Parity.** Results match the sheet to the koruna for the 2026 defaults and agreed edge scenarios.
- **Mobile speed.** Splitting an invoice takes ≤ 10 s from the home-screen icon, one-handed.
- **Privacy.** The app works fully offline after the first visit, needs no account, and keeps all data on the device.
- **Maintainable rules.** Yearly tax constants can be updated without touching the calculation logic.
- **Safe defaults.** Every derived value has a sensible default, and the user can override the ones the sheet allows.

**Non-goals (v1)**

- Bookkeeping, invoicing, or filing tax returns.
- VAT (DPH), the 3rd paušální daň band, or income above 1.5M Kč. This matches the sheet's own scope; the app warns instead.
- Tax advice or any guarantee of legal accuracy.
- Accounts, sync, or a server backend.

## Target users

The primary user is a working OSVČ who invoices regularly and wants a fast, trustworthy split of every invoice.

| Persona | Situation | Main need | Frequency |
| --- | --- | --- | --- |
| Working freelancer | OSVČ on 60 % expense rate, typically IT or creative | Split each invoice; sanity-check the hourly rate | Weekly |
| Switcher | Employee weighing a move to OSVČ | Find the rate that equals a given salary | A few sessions |
| Sheet user | Already uses the spreadsheet, often via the author's YouTube video | Same results, less friction | Monthly |
| Author and first user (Dan) | Solo web developer in Prague | Dogfood every feature before release | Weekly |

## User stories

Stories 1–6 reproduce the sheet; 7–10 are what an app adds on top.

1. As a freelancer, I enter my working days, hours, and rate, and I see my real net monthly income and the equivalent employee gross salary.
2. As a freelancer who just sent an invoice, I type its amount and see how much to set aside for taxes and insurance, costs, reserve, and holiday, and what is left to spend.
3. As a freelancer, I list my business costs with price and amortisation months, and they flow into the result.
4. As a freelancer, I see whether paušální daň would save me money, and by how much per year.
5. As someone who knows my exact figures, I override a derived value (tax-deductible costs, total levies) and see everything downstream update. I can reset it to the calculated value.
6. As a user, I am warned when my inputs leave the model's valid range (above 1.5M Kč, below minimum wage).
7. As a switcher, I enter a target net monthly income and get the hourly rate I need. The sheet only works forward.
8. As a user, I save named scenarios (for example 650 vs 800 Kč/h) and compare them side by side.
9. As a user, I share my calculation as a link, with nothing leaving my device except that link. I can also share the app itself.
10. As a user, I export and import my data as a file, so I can move devices or keep a backup.
11. As a user, I switch between tax years: the two previous years, the current one, and the next. If the next year has no official numbers yet, I am told they will be added as soon as possible, and I can enter my own numbers in the meantime.

## Scope

Everything ships in v1: the sheet done well on a phone, plus everything an app makes possible, across a window of tax years.

| Feature | Stories | Notes |
| --- | --- | --- |
| Calculator: inputs → net income, levies, gross equivalent | 1 | Full parity with the výpočet sheet; the gross salary is calculated in the app, with no outside link |
| Invoice splitter | 2 | Opens as the default screen once set up |
| Costs list with amortisation | 3 | Replaces the náklady sheet; add, edit, delete rows |
| Paušální daň comparison | 4 | Shown as a one-line hint, like the sheet |
| Overrides with reset | 5 | Only on values the sheet marks blue |
| Range warnings | 6 | Inline, never blocking |
| Install, offline, local persistence | all | Inputs survive reloads and app updates |
| Reverse calculation: target net → hourly rate | 7 | New; not in the sheet |
| Named scenarios and comparison | 8 | Side by side on desktop, swipe on mobile |
| Share my calculation | 9 | A link with my inputs encoded in the URL; nothing is stored on a server |
| Share app | 9 | The system share sheet (Web Share API), falling back to copying the app link |
| Export and import (JSON) | 10 | Backup and device move |
| Other expense rates (30, 40, 80 %) | — | Expense rate picked from 30 / 40 / 60 / 80 %; paušální daň band limits follow the rate |
| English UI | — | Czech first |
| Tax year switcher: 2 past years, current, next | 11 | Next year without data: "will be updated ASAP" or enter your own numbers |
| Full tax credits and deductions | 1 | Replaces the sheet's two lump-sum fields; ported from Dan's Python tax library |

## Functional requirements

The calculation is a one-way pipeline from about 13 inputs to 17 outputs. Every step must reproduce the sheet's rounding exactly.

*Diagram: calculation flow in 8 stages: inputs → invoiced → total levies → after tax and costs → per day → net income → gross salary equivalent, plus the invoice split. See the Claude Doc.*

The invoice split reuses the yearly shares instead of recalculating tax per invoice, so it always agrees with the yearly model.

### Inputs

| Input | Default | Unit | Sheet name |
| --- | --- | --- | --- |
| Working days per year | 250 | days | dnuPracovnichRocne |
| Vacation days | 20 | days | dnuDovolene |
| Hours worked per day, incl. non-billable | 5 | h | denneHodin |
| Non-billable hours per year | 80 | h | nefakturovatelneHodinyRocne |
| Hourly rate | 650 | Kč | hodinovaSazba |
| Uses paušální daň | No | yes/no | pausalniDan |
| Expense rate (výdajový paušál) | 60 | %: 30, 40, 60 or 80 | sazbaPausalu |
| Tax deductions | none | itemised, see below | odecitatelnePolozky |
| Tax credits | payer credit only | itemised, see below | dalsiSlevyNaDani |
| Children, with ZTP/P status and months per child | 0 | count | pocetDeti |
| Voluntary sickness insurance | No | yes/no; the amount is calculated (issue 7) | NP |
| Reserve | 1.5 | months/year | rezervaMesicu |
| Costs list | 4 rows, 47 000 total | Kč/year | naklady |
| Invoice amount (splitter) | 10 000 | Kč | C42 |

### Tax credits and deductions

The app does the full OSVČ income-tax calculation. It replaces the sheet's two lump-sum fields ("odečitatelné položky" and "další slevy na dani") with itemised inputs. The rules, caps and per-year amounts come from Dan's existing Python tax library, which covers past years and has tests. Its calculations and tests are ported to TypeScript.

| Group | Inputs | Notes |
| --- | --- | --- |
| Credits (from the tax) | Payer credit; children (count, ZTP/P, months); spouse; disability by degree; ZTP/P holder; student, školkovné and EET where the year allows them | A year shows only the credits valid in it; student, školkovné and EET return in 2027 |
| Deductions (from the tax base) | Gifts; mortgage interest; retirement products (pension savings, DIP, life insurance); union dues; blood and organ donation; further-education exams | Each item is capped as the year's rules say |
| Child bonus | Derived | Tax can go below zero only within the bonus eligibility rules (known issue 3) |

- Credits and deductions are not allowed under paušální daň, so the paušální daň comparison treats them as lost.
- The employee side of the comparison applies the same personal credits, so the gross salary compares like with like.
- Each item shows its cap and a one-line explanation; the inputs are collapsed until the user opens them.

### Calculation rules

- **Billable hours** = (working days − vacation days) × hours per day − non-billable hours.
- **Invoiced** = billable hours × hourly rate.
- **Tax-deductible costs** = expense rate × min(invoiced, 2 000 000). This value is overridable.
- **Tax base** = invoiced − tax-deductible costs − deductible items, rounded down to whole hundreds (issue 13).
- **Income tax** = max(0, 15 % × tax base up to 36 × the average wage + 23 % × the part above it (issue 14) − payer credit − other credits) − 12 × monthly child credits. The result may be negative, which represents the daňový bonus.
- **Health insurance (ZP)** = 13.5 % × max(50 % of profit, minimum ZP base), rounded up to whole Kč.
- **Social insurance (SP)** = 29.2 % × max(SP share × profit, minimum SP base), rounded up to whole Kč. The SP share is per-year data, 55 % by law for 2024–2027.
- **Total levies**:
    - With paušální daň: monthly band amount × 12 + sickness insurance.
    - Otherwise: ZP + SP + income tax + sickness insurance.
    - This value is overridable.
- **Calculation days** = round up (working days ÷ 12 × (12 + reserve months)).
- **Per day** = (after tax − costs) ÷ calculation days, rounded to tens.
- **Reserve** = (calculation days − working days) × per day.
- **Holiday** = vacation days × per day.
- **Net yearly** = after costs − reserve, rounded to thousands.
- **Net monthly** = (after costs − reserve) ÷ 12, rounded to hundreds. It divides the unrounded yearly figure; dividing the rounded 477 000 would give 39 800, not 39 700.
- **Invoice split** = invoice × each share (levies, costs, reserve, holiday) of yearly invoiced, each rounded to hundreds. The remainder is shown as "can spend".

Rounding must use Sheets semantics: half away from zero, with negative digit counts allowed.

### Outputs and parity fixture

With the default inputs, the app must show exactly these values. This table is the acceptance test for 2026; each past year gets its own from its sheet.

| Output | Expected (Kč) |
| --- | --- |
| Invoiced per year | 695 500 |
| Tax-deductible costs | 417 300 |
| Tax base | 278 200 |
| Income tax | 10 890 |
| Health insurance (ZP) | 39 664 |
| Social insurance (SP) | 60 056 |
| Total levies (15.9 % of invoiced) | 110 610 |
| After tax | 584 890 |
| After tax and costs | 537 890 |
| Reserve per year | 61 120 |
| Holiday per year | 38 200 |
| Net yearly | 477 000 |
| Net monthly | 39 700 |
| Per day, incl. reserve and holiday | 1 910 |
| Gross salary equivalent | 50 589 (sheet estimate 50 600) |
| Invoice split of 10 000: levies / costs / reserve / holiday / spend | 1 600 / 700 / 900 / 500 / 6 300 |

Each year in the window has its own fixture. Years 2024–2026 use their sheet's default inputs and match the sheet. 2027 uses the 2026 default inputs with the researched 2027 constants, so it serves as a forecast check.

| Output (Kč) | 2024 | 2025 | 2026 | 2027 |
| --- | --- | --- | --- | --- |
| Inputs | 700 Kč/h, 252 days | 700 Kč/h, 251 days | 650 Kč/h, 250 days | 650 Kč/h, 252 days |
| Invoiced | 756 000 | 752 500 | 695 500 | 702 000 |
| Income tax | 14 520 | 14 310 | 10 890 | 11 280 |
| ZP | 35 614 | 37 712 | 39 664 | 41 848 |
| SP | 48 566 | 57 098 | 60 056 | 63 363 |
| Total levies | 98 700 | 109 120 | 110 610 | 116 491 |
| Net monthly | 45 100 | 44 100 | 39 700 | 39 800 |
| Gross equivalent | 57 953 (sheet 57 500) | 56 585 (sheet 56 100) | 50 589 (sheet 50 600) | 50 737 |
| Split of 10 000: levies / costs / reserve / holiday / spend | 1 300 / 600 / 900 / 600 / 6 600 | 1 500 / 600 / 900 / 600 / 6 400 | 1 600 / 700 / 900 / 500 / 6 300 | 1 700 / 700 / 900 / 500 / 6 200 |

The default inputs hide the sheets' SP-share bug, because SP falls back to the minimum base. The fixtures therefore add an edge case: 2026 at 1 000 Kč/h. Under the law SP is 68 737 Kč and net monthly is 65 100 Kč. The sheet gives 81 235 Kč and 64 200 Kč. The gross salary is approximate by nature, so its fixtures pass when the resulting net is at or up to 20 Kč above the target. The sheets rounded the gross to hundreds. The 2024 and 2025 sheets also used the old employee social rate (issue 12), so their gross figures are about 450–490 Kč low.

### Behaviour

- **Live results.** Results update on every keystroke, with no submit button.
- **Overrides.** An overridden value is visibly marked and has a one-tap reset. Downstream values recompute from it.
- **Warnings** are derived and never block input:
    - Above 1.5M Kč invoiced: the model is out of scope (3rd band, higher tax, VAT).
    - Gross equivalent below minimum wage.
    - Paušální daň selected while invoicing above band 2.
- **Paušální daň hint.** "Would save / would cost you X Kč a year", the same comparison the sheet makes. It counts the credits and deductions the user would lose under paušální daň.
- **Gross salary, calculated in the app.** There is no link to an outside calculator; the sheet linked to Kurzy.cz. The app computes an employee's net pay from gross with the year's payroll rules. Employee social insurance is 7.1 % and health insurance 4.5 %, each rounded up. The tax advance is 15 % of gross rounded up to hundreds, or 23 % above the solidarity threshold, minus the payer credit. The same personal credits as on the OSVČ side apply, so the comparison is like for like. The app then searches iteratively, by bisection over whole Kč, for the gross whose net reaches the OSVČ net monthly. Rounding makes net pay a step function: the tax base rounds to hundreds, so net jumps by up to about 15 Kč, and an exact match is not always possible. The app shows the smallest gross whose net is at or just above the target, marked as approximate (≈), with its breakdown: gross, employee SP, ZP, tax advance and the resulting net.
- **Field help.** Each field keeps the sheet's explanatory note as inline help.

### Tax years

The app covers a rolling window of four tax years: the two previous years, the current year, and the next. The current year opens by default. Each January the oldest year drops out and the new next year is added.

Today the window is 2024–2027. 2027 already has official values, so the "coming soon" state first appears for 2028, when the window rolls forward in January 2027.

| Year | What the user sees |
| --- | --- |
| Previous 2 years | Official constants from that year's sheet, labelled as historical |
| Current | Official constants, including any mid-year period |
| Next, data published | Official constants, as soon as they are entered |
| Next, no data yet | Notice "Hodnoty pro {rok} doplníme co nejdříve" with two choices: wait, or enter your own numbers |

- **Year switcher.** It is always visible in the header. Each year keeps its own inputs and costs, as a record of that year. A "Sync inputs across years" switch, off by default, makes all years share one set so a scenario can be compared across years.
- **Year-specific defaults.** Working days per year comes from each year's data (250 in 2026). A value the user has edited stays as they set it.
- **Own numbers for the next year.** The form opens prefilled with the current year's constants. Custom values are stored on the device, and every result computed from them is marked "vlastní hodnoty". When official values ship, the app asks once whether to switch to them or keep the custom ones.
- **Mid-year periods.** One set of values applies to the whole year. A mid-year change such as July 2026 is entered as that year's value, even for the months before it.
- **Year-on-year change.** Net monthly shows the difference from the previous year for the same inputs.

## Non-functional requirements

The app is static, local-only, and small enough to feel instant on a mid-range phone.

| Area | Requirement |
| --- | --- |
| PWA | Installable on Android, iOS and desktop. Works fully offline after the first visit. Updates in the background and offers "new version, reload". |
| Privacy | No backend and no account. All data stays in device storage. A share link carries only the inputs the user chose to share. |
| Performance | Recalculation under 16 ms per keystroke. Initial JS under 50 KB gzipped. Lighthouse performance ≥ 95. |
| Accessibility | WCAG 2.2 AA. Every input is labelled and uses a numeric keyboard. Key results are announced politely to screen readers when they change. |
| Localisation | Czech UI and cs-CZ money format ("39 700 Kč"). Czech is the default; English is selectable. |
| Browser support | Baseline 2024. Anything newer, such as CSS anchor positioning or field-sizing, needs a fallback or is avoided. |
| Layout | Works from 360 px phones to desktop. On desktop, inputs and results sit side by side. |
| Trust | A permanent disclaimer: estimate, not tax advice. The UI shows the date the tax constants are valid from and links to the year sheets it is based on. |
| Hosting | Static build on GitHub Pages, deployed from the repository. |
| Licence and support | MIT, open source on GitHub. No support; problems are reported as GitHub issues, linked from the app. |
| Analytics | None. No trackers and no cookies. |

## Tax constants and maintenance

Constants live in data, one set per tax year, so a new year or a mid-year change is a data change, not a code change. The table covers the launch window, 2024–2027. Values for 2024–2026 come from the year sheets, corrected against the law where a sheet is wrong. Values for 2027 were researched from official announcements published in September and October 2026.

| Constant | 2024 | 2025 | 2026 | 2027 |
| --- | --- | --- | --- | --- |
| Status | historical | historical | current | next, official values out |
| Working days | 252 | 251 | 250 | 252 |
| Average wage (Kč/month) | 43 967 | 46 557 | 48 967 | 51 663 |
| Minimum ZP base, 50 % of average wage (Kč/year) | 263 802 | 279 342 | 293 802 | 309 978 |
| Minimum SP base (Kč/year) | 158 292 (30 %); the sheet has 131 904, which is wrong | 195 540 (35 %) | 205 668 (35 %, after the July change; was 40 %) | 216 996 (35 %) |
| SP share of profit | 55 % | 55 %; the sheet uses 60 %, which is wrong | 55 %; the sheet uses 65 %, which is wrong | 55 % |
| ZP share of profit | 50 % | 50 % | 50 % | 50 % |
| Paušální daň band 1 (Kč/month) | 7 498 | 8 716 | 9 162 (9 984 until July) | 9 662 |
| Paušální daň band 2 (Kč/month) | 16 745 | 16 745 | 16 745 | 16 745 |
| Minimum wage (Kč/month) | 18 900 | 20 800; the sheet has 18 900, which is wrong | 22 400 | 24 900 |
| Payer credit (Kč/year) | 30 840 | 30 840 | 30 840 | 30 840 |
| Child credits, 1st / 2nd / 3rd+ (Kč/month) | 1 267 / 1 860 / 2 320 | 1 267 / 1 860 / 2 320 | 1 267 / 1 860 / 2 320 | 1 267 / 1 860 / 2 320; no change announced, verify |
| New credits for "other credits" | — | — | — | Student 4 020/year, školkovné up to 24 900 per child, EET 5 000 |
| Solidarity threshold, 3 × average wage (Kč/month; 36 × per year) | 131 901 | 139 671 | 146 901 | 154 989 |
| Employee SP / ZP, for the gross salary | 7.1 % / 4.5 % | 7.1 % / 4.5 % | 7.1 % / 4.5 % | 7.1 % / 4.5 % |

The remaining rates are unchanged across the window: income tax 15 % (23 % above the solidarity threshold), ZP 13.5 %, SP 29.2 %, and the expense cap at 2 000 000 Kč of income. The 2023 sheet was reviewed too but falls outside the window and is not shipped.

**The July 2026 change.** Law 90/2026 Sb. cut the minimum SP base from 40 % to 35 % of the average wage, retroactively from January. Paušální daň band 1 fell with it, from 9 984 to 9 162 Kč. Because the cut is retroactive, the yearly calculation uses one value for all of 2026. The 2026 sheet already uses the new values.

**History.** The 2024, 2025 and 2026 sheets share one structure. Between years only the constants and the SP share of profit change, so all four years run on one rule set with per-year data. The SP share is the important catch: the law keeps it at 55 % for every year from 2024 to 2027, but the 2025 and 2026 sheets raise it to 60 % and 65 %. See known issue 9.

**Sources:** [2024 sheet](https://docs.google.com/spreadsheets/d/1wfhBbUzv8sMiuCf-oo80_URYs3F4mzMobcK0b1-nYIA), [2025 sheet](https://docs.google.com/spreadsheets/d/1dKazO_2dM4fmQjwkbrB5eEHh4XQw4tXFcYzgcc7EKNo), [2026 sheet](https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s), [average wages 2019–2026 (VZP)](https://www.vzp.cz/platci/informace/osvc/osvc-prumerna-mzda), [2027 average wage, NV 177/2026 Sb. (Money)](https://money.cz/novinky-a-tipy/?p=19357), [2027 minimum payments (Forvis Mazars)](https://www.forvismazars.com/cz/cs/prehledy/forvis-mazars-v-mediich/archiv-2026/kolik-zaplatite-na-zalohach-v-roce-2027), [2027 paušální daň (Forvis Mazars)](https://www.forvismazars.com/cz/cs/prehledy/forvis-mazars-v-mediich/archiv-2026/pausalni-dan-2027-podnikatele-si-priplati), [2027 minimum wage (MPSV)](https://mpsv.gov.cz/minimalni-mzda-v-roce-2027-vzroste-na-24-900-korun), [SP share 55 % in 2027 (E15)](https://www.e15.cz/minimalni-zalohy-osvc-socialni-pojisteni-2027), [July 2026 change (iustoria)](https://www.iustoria.cz/pojisteni/zalohy-osvc/), [2027 tax credits (BusinessInfo)](https://www.businessinfo.cz/clanky/skolkovne-i-sleva-na-studenta-od-roku-2027-se-vraceji-slevy-na-dani-z-prijmu/).

**Update process**

1. Check the official sources each December and after any announced mid-year change: Finanční správa, ČSSZ, and the health insurers.
2. Add a new period to the data with its effective-from date and a source link for each value.
3. Extend the parity fixture for the new period and run the tests.
4. Release. The "valid from" date in the UI updates on its own.
5. Each January, drop the oldest year and open a slot for the new next year, which shows the "coming soon" notice until its data is in.

## Value verification

Every value and every calculation is checked twice before it ships, against official state sources wherever they exist. A value that fails either check blocks the release, and an unverified value is marked in the UI.

1. **Primary source.** Each value links to an official state source: the law or government regulation in the Sbírka zákonů (e-Sbírka), or the official page of Finanční správa, ČSSZ, VZP or MPSV.
2. **Second source.** A second source must state the same number, preferably another official one (for example the regulation and the ČSSZ page). A professional publication counts only when no second official source exists. A value with one source stays "unverified".
3. **Derivation check (automated).** Values that follow from the average wage are recomputed from it in CI and must match exactly:
    - minimum ZP base = 50 % × average wage
    - minimum SP base = the year's share × average wage, rounded up
    - solidarity threshold = 3 × average wage per month
    - paušální daň band 1 = minimum ZP + 1.15 × minimum SP + 100 Kč, each part rounded up
4. **Output check.** Each year's fixture is compared against its year sheet, with known sheet bugs listed as expected differences. The gross-salary calculation is compared against an independent payroll calculator for at least three gross amounts per year, one of them above the solidarity threshold. Net pay must match to the koruna; only the reverse search (net → gross) is approximate. The test cases from Dan's Python tax library are ported with it and must pass for every year they cover.
5. **Calculation check against the state.** Every calculation, not just the values, is checked against official sources. These are the worked examples in Finanční správa and ČSSZ guidance, the official tax-return and Přehled forms with their instructions, and official state calculators where they exist. Each official example becomes a test case. Dan's Python library and the year sheets are cross-checks, not the authority: where they disagree with an official source, the official source wins.
6. **Fresh-eyes review.** Someone who did not enter the values, a person or a separate AI agent, re-derives every new value from the sources before release.
7. **Status in the data.** Each value stores its sources and a status, researched or verified. The app shows an "unverified" badge next to any result that depends on an unverified value, including the user's own numbers.

The first run on 30 October 2026 covered the derivation check for all four years. Every value passes, and the check catches the 2024 sheet's minimum SP base (issue 10).

| Check | 2024 | 2025 | 2026 | 2027 |
| --- | --- | --- | --- | --- |
| Minimum ZP base | pass | pass | pass | pass |
| Minimum SP base | pass; the sheet fails | pass | pass | pass |
| Solidarity threshold | pass | pass | pass | pass |
| Paušální daň band 1 | pass | pass | pass | pass |
| Two sources: minimum wage, band 2, credits | to do | to do | to do | minimum wage and band 2 done; child credits have one source |
| Payroll cross-check of the gross salary | to do | to do | to do | to do |
| Calculations against official worked examples | to do | to do | to do | to do |

## Known issues in the source sheet

Fourteen issues turned up across the year sheets. The app follows the law where a sheet is wrong, and because Dan owns the sheets, issues 9–14 can be fixed in the sheets too.

| # | Issue | Impact | Resolution |
| --- | --- | --- | --- |
| 1 | The paušální daň band check uses total income only, but band limits depend on the expense rate. | The "would pay off" hint can be wrong above 1M Kč. | Model the band rules by rate. Band 1: up to 1M, or 1.5M at 60/80 %, or 2M at 80 %. Band 2: up to 1.5M, or 2M at 60/80 %. |
| 2 | The holiday share uses the unrounded per-day value, while the holiday amount uses the rounded one. | The invoice split is off by a few Kč against the yearly figure. | Use one value for both. |
| 3 | Child credits can push tax below zero with no eligibility check (minimum income, minimum bonus). | A bonus may be shown that the user would not receive. | Label it as daňový bonus and add the eligibility check. |
| 4 | The gross estimate comes from a bound Apps Script that the Sheets API cannot read. | The sheet's gross logic cannot be inspected. | Resolved: the app calculates the gross from the payroll rules, so the script is not needed. |
| 5 | 13 named ranges are zero-height (mzmSkupina1–8, mzdaSuperhruba, slevaNaDeti, cistehoHodina, cistehoHodinaFakturovatelna). They are leftovers from older sheets, such as 2023's minimum guaranteed wage table. | None. | Drop them. |
| 6 | The note says other expense rates are unsupported, but the cost formula already works for any rate. | Users are turned away unnecessarily. | Decided: v1 supports 30, 40, 60 and 80 %, with band rules per #1. |
| 7 | Sickness insurance is a free-entry yearly amount. | Users must calculate it elsewhere. | Calculate it from the rate and base in v1. |
| 8 | Past years' sheets might differ in formulas, not only in values. | One shared rule set could miscalculate a past year. | Checked: 2024–2026 share one structure, and only the constants and the SP share differ. One rule set with per-year data. |
| 9 | The 2025 and 2026 sheets compute SP from 60 % and 65 % of profit. The law sets 55 % for 2024–2027. | SP is overstated once profit is above the minimum base. At 1 000 Kč/h in 2026: 81 235 instead of 68 737 Kč a year, and net monthly 900 Kč too low. The default inputs hide it. | Use 55 %, add the edge case to the fixtures, and fix the sheets. |
| 10 | The 2024 sheet has a minimum SP base of 131 904 Kč (25 % of the average wage). The law set 30 %, 158 292 Kč. | Wrong only for low incomes; the defaults are unaffected. | Use 158 292 and fix the sheet. |
| 11 | The 2025 sheet keeps the 2024 minimum wage (18 900 Kč). The 2025 value was 20 800 Kč. | The minimum-wage warning is wrong, and the gross estimate may shift. | Use 20 800 and fix the sheet. |
| 12 | The 2024 and 2025 sheets' gross estimates match the old employee social rate of 6.5 %. From 2024 it is 7.1 %, because the 0.6 % sickness insurance came back. | The gross is understated by about 450 Kč (2024) and 490 Kč (2025) at the default inputs. | Use 7.1 %; the payroll cross-check covers it. |
| 13 | All three sheets use the tax base unrounded. The law rounds it down to whole hundreds. | Income tax can be up to 15 Kč too high. Every fixture, including the 1 000 Kč/h case, has a round tax base, so none of them shows it. | Round down to hundreds after deductible items, add an edge case to the fixtures, and fix the sheets. |
| 14 | All three sheets tax at a flat 15 %. The 23 % rate above 36 × the average wage is missing. | None in the supported range: the 2026 threshold is a tax base of 1 762 812 Kč, far beyond 1.5M Kč invoiced. Results above that limit are understated. | Apply 23 % above the threshold so out-of-range results stay right, and fix the sheets. |

## Success metrics

v1 succeeds when it is exact, fast, and the first user stops opening the spreadsheet.

| Metric | Target | Measured by |
| --- | --- | --- |
| Calculation parity | 100 % of fixture values for each supported year's defaults, plus at least 5 edge scenarios (3 children, paušální daň on, over 1M Kč, below minimum wage, overrides, SP above the minimum at 1 000 Kč/h, each expense rate, a tax base that is not a whole hundred) | Automated tests |
| Time to split an invoice | ≤ 10 s from the home-screen icon | Manual test on a mid-range phone |
| Quality | Lighthouse performance ≥ 95, accessibility 100, installable | Lighthouse in CI |
| Dogfooding | Every invoice for 3 months split in the app, with no sheet fallback | Dan's own log |
| Constants freshness | New tax values live within 7 days of an official change | Release dates |
| Verified values | 100 % of shipped values have two sources, preferably official, and pass the derivation check; every calculation passes the official worked examples | Verification report in CI |

## Risks and open questions

The biggest risk is trust: one wrong tax number and users go back to the spreadsheet.

| Risk | Mitigation |
| --- | --- |
| Wrong tax figures | Verified constants with source links, a parity fixture per year, a permanent disclaimer, and GitHub issues for reports |
| Yearly maintenance is forgotten | A scheduled December reminder; the UI flags constants older than the current year |
| Scope creeps into accounting | Non-goals above; anything beyond planning goes to a separate product |

**Decisions and open questions**

- [x] Gross salary: calculated in the app by an iterative search, approximate because of rounding, with no link to an outside calculator. The Apps Script source is no longer needed.
- [x] Author: Dan Srb owns the sheets, so the app needs no outside permission.
- [x] Product: a personal tool shared with the world. It is open source under MIT on GitHub, hosted on GitHub Pages, with no support beyond GitHub issues.
- [x] Analytics: none.
- [x] Name: "OSVČ vs. zaměstnanec", the same as the sheet.
- [x] Sharing: both "share app" and "share my calculation".
- [x] July 2026 and other mid-year changes: one value for the whole year, including the months before the change.
- [x] Expense rates: 30, 40, 60 and 80 % are all in v1.
- [x] Employer cost: not needed. The comparison already shows total levies, which covers it.
- [x] Inputs across years: each year keeps its own inputs by default. A "Sync inputs across years" switch, off by default, shares them.
- [ ] Dan shares his Python tax library and tests, the source for credits, deductions and their per-year amounts.
- [x] Tax calculation: the full OSVČ calculation with itemised credits and deductions, ported to TypeScript from Dan's Python library.

## Delivery

Everything ships at once, in one release with no phases. It is done when every item below is ticked.

- [ ] Dan's Python tax library and its tests are ported to TypeScript and pass.
- [ ] Every value and every calculation for 2024–2027 passes the value verification against official state sources.
- [ ] Each year's parity fixture passes, with the known sheet bugs as documented differences.
- [ ] Every feature in Scope works: calculator with full credits and deductions, costs, invoice splitter, overrides, warnings, year switcher with own numbers and input sync, reverse calculation, scenarios, share app, share my calculation, export and import, all four expense rates, Czech and English UI.
- [ ] Lighthouse targets are met, and the app installs and works offline.
- [ ] Dan uses it for 2 weeks with no fallback to the sheet.
- [ ] Sheet issues 9–14 are fixed in the year sheets.
- [ ] The repository is public under MIT and deployed to GitHub Pages, with the disclaimer, links to the year sheets and a link for reporting issues.
- [ ] Yearly upkeep is written down: each January the window moves forward, and new values go through the same verification.
