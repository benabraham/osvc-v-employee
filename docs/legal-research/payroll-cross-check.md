# Payroll cross-check of the gross salary

PRD "Value verification" step 4: the employee net wage behind the gross equivalent is compared with independent payroll calculators for at least three gross amounts per year, one above the 23 % threshold, and with a hand calculation from the statutes. Captured on 5 November 2026. Test: `src/calc/employee-net-wage.cross-check.test.ts`.

## Method

- Calculators: [kurzy.cz](https://www.kurzy.cz/kalkulacka/vypocet-ciste-mzdy-2026/) (year pages for 2024, 2025 and 2026, `?hruba_mzda=<gross>`), [mesec.cz](https://www.mesec.cz/kalkulacky/vypocet-ciste-mzdy/) and [vypocet.cz](https://www.vypocet.cz/cista-mzda) (current year only), driven with Playwright. No official state payroll calculator exists.
- Hand calculation from the statutes (e-Sbírka): zákon 589/1992 Sb. § 7 (7.1 % employee contribution, in 2024 "z toho 0,6 % na nemocenské pojištění", rounded up once, § 7 odst. 3); zákon 592/1992 Sb. (one third of 13.5 % = 4.5 %, rounded up); zákon 586/1992 Sb. § 38h (advance base rounded up to hundreds, 15 % up to 3 × the average wage a month and 23 % above, advance rounded up to whole crowns, minus the monthly payer credit 2 570 Kč), § 35c and § 35d (child credit).
- Payer credit only, no children, unless stated.

## Results (Kč a month)

| Year | Gross | SP | ZP | Tax advance | Net (ours) | Calculators | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2024 | 35 000 | 2 485 | 1 575 | 2 680 | 28 260 | kurzy.cz 28 260 | match |
| 2024 | 40 001 | 2 841 | 1 801 | 3 445 | 31 914 | kurzy.cz 31 914 | match after the fix below |
| 2024 | 160 000 | 11 360 | 7 200 | 23 678 | 117 762 | kurzy.cz 117 762 | match, above the threshold |
| 2025 | 35 000 | 2 485 | 1 575 | 2 680 | 28 260 | kurzy.cz 28 260 | match |
| 2025 | 80 000 | 5 680 | 3 600 | 9 430 | 61 290 | kurzy.cz 61 290 | match |
| 2025 | 160 000 | 11 360 | 7 200 | 23 057 | 118 383 | kurzy.cz 118 384 (advance 23 056) | ours follows the law, see below |
| 2026 | 35 000 | 2 485 | 1 575 | 2 680 | 28 260 | kurzy.cz, mesec.cz, vypocet.cz 28 260 | match |
| 2026 | 80 000 | 5 680 | 3 600 | 9 430 | 61 290 | kurzy.cz, mesec.cz, vypocet.cz 61 290 | match |
| 2026 | 160 000 | 11 360 | 7 200 | 22 478 | 118 962 | kurzy.cz, vypocet.cz 118 962; mesec.cz 118 962.08 (advance not rounded) | match, above the threshold |
| 2026 | 80 000, 2 children | 5 680 | 3 600 | 6 303 | 64 417 | mesec.cz, vypocet.cz 64 417 | match |

The hand calculation agrees with our calculator in every case. 2027 has no calculator yet; the hand calculation from the 2027 wording agrees (for example 160 000 Kč: tax 21 831, net 119 609).

## Differences found

- **2024 contribution rounded once.** Our first version rounded 6.5 % and 0.6 % separately (40 001 Kč: SP 2 842). kurzy.cz and the 2024 wording of § 7 round the 7.1 % once (2 841). Fixed; see `docs/calc-port-notes.md`.
- **kurzy.cz 2025 above the threshold.** 15 % × 139 671 + 23 % × 20 329 − 2 570 = 23 056.32 Kč. § 38h odst. 3 rounds the advance up to 23 057 Kč; the kurzy.cz 2025 page shows 23 056. Its 2024 and 2026 pages round up. We keep the law.
- **kurzy.cz ignores children in the URL.** The 2-children cases use mesec.cz and vypocet.cz.
