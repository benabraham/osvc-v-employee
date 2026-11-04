# Year values

Every year-specific number the tests expect, with the state body that publishes it. 2027 amounts were not published by VZP, ČSSZ or Finanční správa as of 4 November 2026, so only the 2027 average wage is tested.

| Value | 2024 | 2025 | 2026 | 2027 | Source |
| --- | --- | --- | --- | --- | --- |
| Average wage (Kč) | 43 967 | 46 557 | 48 967 | 51 663 | [VZP](https://www.vzp.cz/platci/informace/osvc/osvc-prumerna-mzda); 2026 nařízení vlády 365/2025 Sb.; 2027 [nařízení vlády 177/2026 Sb.](https://www.zakonyprolidi.cz/cs/2026-177): 48 900 × 1,0565 = 51 662,85, rounded up |
| Minimum wage (Kč a month) | 18 900 | 20 800 | 22 400 | 24 900 | [MPSV overview](https://mpsv.gov.cz/prehled-o-vyvoji-castek-minimalni-mzdy), [MPSV 2027](https://mpsv.gov.cz/minimalni-mzda-v-roce-2027-vzroste-na-24-900-korun) |
| ZP minimum monthly base / advance (Kč) | 21 983,50 / 2 968 | 23 278,50 / 3 143 | 24 483,50 / 3 306 | – | [VZP](https://www.vzp.cz/platci/informace/osvc/osvc-minimalni-vyse-zaloh) |
| SP minimum yearly base (Kč) | 158 292 | 195 540 | 205 668 | – | [ČSSZ](https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc); 2026 at 35 %: 17 139 Kč a month, advance 5 005 Kč ([ČSSZ, July 2026](https://www.cssz.gov.cz/-/informace-pro-osvc-o-zmene-pojistneho-na-duchodove-pojisteni-od-1-7-2026)) |
| New OSVČ SP minimum yearly base (Kč) | 131 904 | 139 680 | 146 904 | – | [ČSSZ](https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc); 2026 monthly 12 242 Kč, advance 3 575 Kč |
| Maximum SP base (Kč a year) | | 2 234 736 | 2 350 416 | – | [ČSSZ](https://www.cssz.gov.cz/maximalni-vymerovaci-zaklad), [MPSV](https://mpsv.gov.cz/socialni-pojisteni) |
| 23 % threshold (36 × average wage, Kč a year) | | | 1 762 812 | – | [Finanční správa](https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace) |
| Paušální daň bands 1 / 2 / 3 (Kč a month) | 7 498 / 16 745 / 27 139 | 8 716 / 16 745 / 27 139 | 9 162 / 16 745 / 27 139 | – | [Finanční správa 2024](https://financnisprava.gov.cz/cs/financni-sprava/media-a-verejnost/tiskove-zpravy-gfr/tiskove-zpravy-2024/pausalni-dan-prilakala-na-32-tisic-osvc), [2025–2026](https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan/informace-k-institutu-pausalni-dane-pro-rok-2025) |
| Paušální daň band 1 parts: tax / pension / health (Kč) | 100 / 4 430 / 2 968 | 100 / 5 473 / 3 143 | 100 / 5 756 / 3 306 | – | Finanční správa, as above |
| Employee sickness eligibility threshold (Kč a month) | 4 000 | 4 500 | 4 500 | 5 000 (derived) | zákon č. 187/2006 Sb. § 6 odst. 2, see [sickness-insurance.md](sickness-insurance.md) |

## Notes

- ČSSZ's table of minimum bases still shows 235 044 Kč for 2026, the 40 % figure from before the July 2026 change. The current act (§ 14 odst. 5), ČSSZ's July 2026 notice and Finanční správa's 9 162 Kč band 1 all use 35 %, so the tests use 205 668 Kč.
- The 2024 year sheet's minimum SP base of 131 904 Kč (PRD known issue 10) equals the 2024 minimum for a *new* OSVČ, not the regular 158 292 Kč.
- Tests that use these values: `osvc-regimes.test.ts` (minimums, paušální daň, average wage), `osvc-plan.test.ts` (2026 rates built from the average wage), `*.law.test.ts` (minimum wage via the exported rates).
