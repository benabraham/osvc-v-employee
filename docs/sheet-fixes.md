# Fixes in the year sheets (PRD known issues 9–14)

Applied on 5 November 2026 through the Google Sheets API. Each sheet's version history (File → Version history) also keeps the state before the change.

Sheets: [2024](https://docs.google.com/spreadsheets/d/1wfhBbUzv8sMiuCf-oo80_URYs3F4mzMobcK0b1-nYIA), [2025](https://docs.google.com/spreadsheets/d/1dKazO_2dM4fmQjwkbrB5eEHh4XQw4tXFcYzgcc7EKNo), [2026](https://docs.google.com/spreadsheets/d/1KU-Gdm4RRoarhcUlEQwg0YooC7LKyl6yXwTw6Tq_E3s). All three share the layout: `výpočet!C17` tax base, `C22` income tax, `C24` SP, `konfigurace!B6` minimum wage, `konfigurace!B8` monthly 23 % threshold, `konfigurace!B15` minimum yearly SP base.

| # | Sheets | Cell | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| 9 | 2025, 2026 | `výpočet!C24` | `…*60%…` (2025), `…*65%…` (2026) | `…*55%…` | SP assessment base is 55 % of profit (zákon 589/1992 Sb. § 5b) |
| 10 | 2024 | `konfigurace!B15` | `131904` | `=12*13191` (158 292) | regular minimum is 30 % of the average wage; 131 904 is the new-OSVČ minimum |
| 11 | 2025 | `konfigurace!B6` | `18900` | `20800` | 2025 minimum wage (nařízení vlády, MPSV) |
| 13 | all | `výpočet!C17` | `=fakturovano-danoveUznatelneNaklady-odecitatelnePolozky` | `=ROUNDDOWN(fakturovano-danoveUznatelneNaklady-odecitatelnePolozky;-2)` | tax base rounded down to whole hundreds (zákon 586/1992 Sb. § 16) |
| 14 | all | `výpočet!C22` | `=MAX(0;vymerovaciZakladDane*0,15-slevaNaPoplatnika-dalsiSlevyNaDani)-12*(…)` | `=MAX(0;MIN(vymerovaciZakladDane;12*solidarityFeeThresholdEmployee)*0,15+MAX(0;vymerovaciZakladDane-12*solidarityFeeThresholdEmployee)*0,23-slevaNaPoplatnika-dalsiSlevyNaDani)-12*(…)` | 23 % above 36 × the average wage (§ 16); `solidarityFeeThresholdEmployee` is the monthly threshold, so × 12 |

The child credit part `-12*(IF(pocetDeti>=1;…))` is unchanged.

## Not fixable through the API: issue 12

The 2024 and 2025 gross estimates (`konfigurace!B18`, `estimateGrossWage(...)`) come from a bound Apps Script, which the Sheets API cannot read or edit. Its employee social rate must be changed to 7.1 % by hand in Extensions → Apps Script. The app does not depend on it: it calculates the gross itself with 7.1 % (6.5 % + 0.6 % in 2024).

## Default results after the fixes (read back from the sheets)

The default inputs do not hit issues 9–14 (SP falls back to the minimum base or 55 % gives the same, and every default tax base is a whole hundred), so the default results stay as in the PRD:

| Sheet | Invoiced | Tax base | Income tax | ZP | SP | Levies | Net monthly |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2024 | 756 000 | 302 400 | 14 520 | 35 614 | 48 566 | 98 700 | 45 100 |
| 2025 | 752 500 | 301 000 | 14 310 | 37 712 | 57 098 | 109 120 | 44 100 |
| 2026 | 695 500 | 278 200 | 10 890 | 39 664 | 60 056 | 110 610 | 39 700 |

The 2024 sheet's minimum SP base now reads 158 292 Kč and the 2025 minimum wage 20 800 Kč.
