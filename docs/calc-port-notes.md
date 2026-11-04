# Calculation notes

`src/calc` holds pure functions for comparing OSVČ income with an employee salary. Each takes its inputs plus a `rates` object for one year and returns every intermediate value. Import them from `src/calc/index.ts`.

| Module | What it covers | Tested against |
| --- | --- | --- |
| `osvc-insurance.ts` | OSVČ yearly health (ZP) and social (SP) insurance | library fixtures |
| `osvc-income-tax.ts` | OSVČ income tax from 2024: deductions, credits, child credit and bonus; retirement products deduction | library fixtures + law tests |
| `employee-net-wage.ts` | Employee net wage, employee and employer contributions | library fixtures + law tests |
| `gross-from-net.ts` | Smallest gross wage that reaches a net wage (gross equivalent) | properties + PRD value 50 589 Kč |
| `osvc-regimes.ts` | Flat-rate expenses, paušální daň bands and amounts, OSVČ minimums (incl. new OSVČ), average wage, voluntary sickness insurance | law tests |
| `osvc-plan.ts` | The PRD pipeline: working time and rate → levies, net income, reserve, holiday, invoice split | PRD 2026 parity fixture and edge cases |
| `benefits.ts` | Sickness benefit (employee, OSVČ), carer's allowance, salary compensation, maternity and paternity | library fixtures |
| `benefit-eligibility.ts` | Who qualifies for maternity, paternity and OSVČ sickness benefit | law tests |

Pensions are left out on purpose: the app only notes that OSVČ pensions are lower.

## Tests

The fixtures in `src/calc/fixtures` come from `reference/harness/generate_fixtures.py`. That folder is git-ignored and holds Dan's private Python tax library. There are two kinds of rows:

- `library-test`: the library's own hand-written test cases.
- `generated`: inputs chosen for coverage, with expected values from running the library. They fill gaps: the library has no own tests for 2024 and 2025 (`test_calc2025.py` is a copy of `test_calc2023.py`, and `test_calc2024.py` only covers 2023 classes).

Each row carries its own `rates`, so formulas shared across years are also checked with 2019–2023 data. Library rows that contradict the law were removed from the generator, and the `*.law.test.ts` and `osvc-regimes.test.ts` files test those rules from the statutes instead.

## Checked against the law

Sources: zákon 586/1992 Sb. (version 157, 1 Aug 2026), 589/1992 Sb. (version 76), 592/1992 Sb. (version 64), 187/2006 Sb. (version 67), 427/2011 Sb. (version 20), all on zakonyprolidi.cz, and Finanční správa guidance.

| Rule | Law | Library | Port |
| --- | --- | --- | --- |
| Union dues, exam fees | Not in § 15 from 2024 | Deducted | Removed |
| Donations | Count above 2 % of the base or from 1 000 Kč, max 15 % (§ 15 odst. 1) | No floor or cap | Law |
| Housing loan interest | 150 000 Kč from 2021, 300 000 Kč for housing acquired earlier, 300 000 Kč combined (§ 15 odst. 4; zákon 386/2020 Sb. čl. IV) | 300 000 Kč for all | Law |
| Child bonus | From 100 Kč, only with § 6/§ 7 income of 6 × the minimum wage (§ 35c odst. 3–4) | Always paid | Law, via `qualifyingIncome` |
| Pension savings | Part of each monthly contribution above 1 700 Kč (§ 15 odst. 7; zákon 427/2011 Sb. § 14) | Yearly 16 200 / 20 400 Kč | Monthly thresholds; 2024 has 1 000 Kč until June, so 16 200 Kč was right for 2024 |
| Long-term care insurance | In the 48 000 Kč cap from 2024 (§ 15 odst. 6) | Missing | Added |
| Employee minimum health base | Minimum wage; the employee tops up 13.5 % of the difference (zákon 592/1992 Sb. § 3, § 9 odst. 10) | Dropped from 2024 | Every year |
| Employee 23 % band | Applies to the tax base above 3 × the average wage | Compares the gross | Same result for whole-crown wages |
| Paušální daň bands | § 2a odst. 5 | Not modelled | `pausalniDanBandFor` |
| Paušální daň amount | Tax 100 / 4 963 / 9 320 Kč (§ 38lk odst. 7) + SP (§ 14 odst. 3) + ZP (§ 3a odst. 5) | Not modelled | `calculatePausalniDanMonthlyAmounts`; band 1 raises the SP premium by 15 %, which matches all published 2024–2027 amounts |
| OSVČ sickness insurance | 2.7 %, minimum base twice the employee threshold (zákon 589/1992 Sb. § 3, § 5b odst. 4; zákon 187/2006 Sb. § 6 odst. 2) | Not modelled | `calculateOsvcSicknessInsurance` |

| New OSVČ minimum SP base | 25 % of the average wage in the start year and the next two, unless an OSVČ in the 20 years before (zákon 589/1992 Sb. § 14 odst. 5) | Not modelled | `isNewOsvcFor`, `calculateOsvcMinimums({ isNewOsvc })`; matches ČSSZ 2026: 12 242 Kč base, 3 575 Kč advance |
| Maternity eligibility | 270 insured days in two years; an OSVČ also 180 days of OSVČ sickness insurance in the last year (zákon 187/2006 Sb. § 32 odst. 2–3) | Not modelled | `isEligibleForMaternityBenefit` |
| OSVČ sickness and paternity eligibility | 3 months of OSVČ sickness insurance before, unless it continued within 8 days from a job insured for its last 3 months (§ 24, § 38a odst. 3) | Not modelled | `isEligibleForOsvcSicknessBenefit`, `isEligibleForPaternityBenefit` |

Rounding follows the library's Python 2 `round()`: exact ties go away from zero, the same as Google Sheets.

## Year values used in tests

Every year-specific number a test expects is published by a state body. 2027 amounts are not published yet (VZP, ČSSZ and Finanční správa had none in November 2026), so only the 2027 average wage is tested.

| Value | 2024 | 2025 | 2026 | 2027 | Source |
| --- | --- | --- | --- | --- | --- |
| Average wage (Kč) | 43 967 | 46 557 | 48 967 | 51 663 | [VZP](https://www.vzp.cz/platci/informace/osvc/osvc-prumerna-mzda); 2026 nařízení vlády 365/2025 Sb.; 2027 [nařízení vlády 177/2026 Sb.](https://www.zakonyprolidi.cz/cs/2026-177) (48 900 × 1.0565) |
| Minimum wage (Kč) | 18 900 | 20 800 | 22 400 | 24 900 | [MPSV](https://mpsv.gov.cz/prehled-o-vyvoji-castek-minimalni-mzdy), [MPSV 2027](https://mpsv.gov.cz/minimalni-mzda-v-roce-2027-vzroste-na-24-900-korun) |
| ZP minimum monthly base / advance (Kč) | 21 983.50 / 2 968 | 23 278.50 / 3 143 | 24 483.50 / 3 306 | – | [VZP](https://www.vzp.cz/platci/informace/osvc/osvc-minimalni-vyse-zaloh) |
| SP minimum yearly base (Kč) | 158 292 | 195 540 | 205 668 | – | [ČSSZ](https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc); 2026 at 35 %: 17 139 Kč a month, advance 5 005 Kč ([ČSSZ, July 2026](https://www.cssz.gov.cz/-/informace-pro-osvc-o-zmene-pojistneho-na-duchodove-pojisteni-od-1-7-2026)) |
| New OSVČ SP minimum yearly base (Kč) | 131 904 | 139 680 | 146 904 | – | [ČSSZ](https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc) |
| Maximum SP base, 23 % threshold (Kč) | | | 2 350 416, 1 762 812 | – | [ČSSZ](https://www.cssz.gov.cz/maximalni-vymerovaci-zaklad), [Finanční správa](https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace) |
| Paušální daň bands 1 / 2 / 3 (Kč a month) | 7 498 / 16 745 / 27 139 | 8 716 / 16 745 / 27 139 | 9 162 / 16 745 / 27 139 | – | [Finanční správa 2024](https://financnisprava.gov.cz/cs/financni-sprava/media-a-verejnost/tiskove-zpravy-gfr/tiskove-zpravy-2024/pausalni-dan-prilakala-na-32-tisic-osvc), [2025–2026](https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan/informace-k-institutu-pausalni-dane-pro-rok-2025) |

ČSSZ's table of minimum bases still shows 235 044 Kč for 2026, the 40 % figure from before the July 2026 change. The current act (§ 14 odst. 5), ČSSZ's own July 2026 notice and Finanční správa's 9 162 Kč band 1 all use 35 %, so the tests use 205 668 Kč.
