# Official worked examples and published amounts

The state publishes worked examples and figures next to its rules. Each one below was copied from a page or PDF fetched on 5 November 2026, with its URL and the section or page it comes from. The expected values are the ones the publication gives. Each example is a test in [src/calc/official-examples.test.ts](../../src/calc/official-examples.test.ts). PRD "Value verification", step 5, asks for this.

Where the calculator disagrees, the test is an `it.fails` block: the calculator is not changed, and the disagreement is listed under [Disagreements](#disagreements). The law wins, as the PRD says.

## Summary

| # | Example | Source | Year | Test result |
| --- | --- | --- | --- | --- |
| E1 | Minimum health advance (ZP) | VZP | 2026 | pass |
| E2 | Minimum social base and advance before 1 July | ČSSZ change notice | 2026 | pass |
| E3 | Minimum social base and advance from 1 July | ČSSZ change notice | 2026 | pass |
| E4 | Yearly saving from the lower minimum: 8 577 Kč | ČSSZ change notice | 2026 | pass |
| E5 | Maximum social base: 48 × average wage | ČSSZ | 2026 | pass |
| E6 | Voluntary sickness premium at 2,7 % (five pairs) and the 9 000 Kč minimum | ČSSZ, Výše a výpočet dávek | 2026 | pass |
| E7 | Sickness reduction thresholds 1 633 / 2 449 / 4 897 Kč | ČSSZ, Výše a výpočet dávek | 2026 | pass |
| E8 | Sickness benefit, Příklad č. 2 | ČSSZ, Výše a výpočet dávek | 2026 | pass |
| E9 | Premium 440 Kč implies base 16 296 Kč | ČSSZ, Příklad č. 2 | 2026 | **it.fails** (D1) |
| E10 | Sickness benefit, Příklad č. 3 (four months) | ČSSZ, Výše a výpočet dávek | 2026 | **it.fails** (D2) |
| E11 | Sickness benefit, Příklad č. 1 (four months) | ČSSZ, Výše a výpočet dávek | 2026 | **it.fails** (D2) |
| E12 | Paušální daň monthly amounts, 2025 | Finanční správa | 2025 | pass |
| E13 | Paušální daň monthly amounts, 2026 | Finanční správa | 2026 | pass |
| E14 | Paušální daň before and after the July 2026 correction | Finanční správa | 2026 | pass |
| E15 | Credits, child credit and bonus minimum | Finanční správa, Pokyny k DAP | 2025 | pass |
| E16 | Solidarity threshold 36 × average wage | Finanční správa, Pokyny k DAP | 2025 | pass |
| E17 | Tax base rounded down to hundreds: 93 295 → 93 200 Kč | Finanční správa, Pokyny k DAP | 2025 | pass |

The `it.fails` cases are D1 and D2 below. Maternity benefit and employee net wage have no official numeric example for 2024–2026 that we could find (see [Not found](#not-found)).

---

## E1 VZP: minimum health advance 2026

- **Source:** VZP ČR, "Jaký je minimální vyměřovací základ?", section OSVČ, https://www.vzp.cz/platci/informace/povinnosti-platcu-metodika/osvc/vymerovaci-zaklad (page as fetched 5 November 2026). Average wage: VZP, "OSVČ - průměrná mzda", https://www.vzp.cz/platci/informace/osvc/osvc-prumerna-mzda
- **Czech:** "Od 1. ledna 2026 je minimální měsíční vyměřovací základ 24 483,50 Kč a z toho minimální měsíční záloha na pojistné je 3 306 Kč." Average wage: "Pro rok 2026 činí průměrná měsíční mzda 48 967 Kč."
- **Inputs:** average wage 2026 = 48 967 Kč.
- **Expected:** minimum monthly base 24 483,50 Kč; minimum monthly advance 3 306 Kč.
- **Test:** `VZP: minimum OSVČ health advance 2026` → `monthly minimum base 24 483,50 Kč and minimum advance 3 306 Kč`. Result: pass.

## E2 and E3 ČSSZ: minimum social base and advance before and after 1 July 2026

- **Source:** ČSSZ, "Informace pro OSVČ o změně pojistného na důchodové pojištění od 1. 7. 2026", https://www.cssz.gov.cz/-/informace-pro-osvc-o-zmene-pojistneho-na-duchodove-pojisteni-od-1-7-2026 (section on the minimum base, 12 June 2026 notice).
- **Czech:** "V důsledku této změny dochází k poklesu minimálního měsíčního vyměřovacího základu pro pojistné, a to ze 40 % průměrné mzdy (min. záloha na pojistné 5 720 Kč) na 35 % průměrné mzdy (min. záloha na pojistné 5 005 Kč)." And: "...nedosahoval alespoň částky minima 40 % průměrné mzdy (tj. 19 587 Kč měsíčně), bylo pojistné stanoveno ve výši tohoto minima (5 720 Kč)." And: "...minima 35 % průměrné mzdy (tj. 17 139 Kč měsíčně)."
- **Inputs:** average wage 2026 = 48 967 Kč; share 40 % (before) and 35 % (from 1 July).
- **Expected:** E2 base 19 587 Kč, advance 5 720 Kč. E3 base 17 139 Kč, advance 5 005 Kč.
- **Tests:** `ČSSZ: minimum OSVČ social base and advance 2026` → `before 1 July 2026 the minimum was 40 %…` and `from 1 July 2026 the minimum is 35 %…`. Result: pass for both.

## E4 ČSSZ: yearly saving from the lower minimum

- **Source:** the same ČSSZ notice as E2 and E3, section on the 2026 annual premium.
- **Czech:** "Pojistné na důchodové pojištění a příspěvek na státní politiku zaměstnanosti tak budete mít nižší o 8 577 Kč (při výkonu činnosti po celý kalendářní rok 2026)."
- **Also on the timing:** "Ke změně výpočtu výše záloh na pojistné (snížení) nedochází zpětně k lednu 2026, ale tato změna se uplatní poprvé až pro výši záloh na pojistné od měsíce července 2026." The annual premium for 2026 is still set on the lower minimum.
- **Inputs:** annual minimum base 19 587 × 12 = 235 044 Kč (40 %) and 17 139 × 12 = 205 668 Kč (35 %); profit share 55 %; no profit above the minimum.
- **Expected:** saving 8 577 Kč. The two annual premiums come to 68 633 Kč and 60 056 Kč, computed by us from the official bases (the notice gives only the difference).
- **Test:** `ČSSZ: minimum OSVČ social base and advance 2026` → `the lower minimum saves 8 577 Kč…`. Result: pass.

## E5 ČSSZ: maximum social base 2026

- **Source:** ČSSZ, "Maximální vyměřovací základ", https://www.cssz.gov.cz/web/cz/maximalni-vymerovaci-zaklad (section for OSVČ).
- **Czech:** "Maximálním vyměřovacím základem osoby samostatně výdělečně činné (OSVČ) pro pojistné na důchodové pojištění a příspěvek na státní politiku zaměstnanosti je částka ve výši 48násobku průměrné mzdy (2 350 416 Kč pro rok 2026)."
- **Expected:** 2 350 416 Kč.
- **Test:** `ČSSZ: minimum OSVČ social base and advance 2026` → `the maximum yearly SP base for 2026 is 48 × the average wage: 2 350 416 Kč`. Result: pass.

## E6 ČSSZ: voluntary OSVČ sickness premium 2026 (2,7 %) and the 9 000 Kč minimum

- **Source:** ČSSZ, "Výše a výpočet dávek", https://www.cssz.gov.cz/vyse-a-vypocet-davek (section on the OSVČ sickness premium). Page title: "Výše a výpočet dávek - Česká správa sociálního zabezpečení".
- **Czech:** "Minimální vyměřovací základ pro pojistné na NP v roce 2026 je 9 000 Kč a měsíční pojistné ve výši 2,7 % tak činí nejméně 243 Kč. Pro názornost uvádíme různé částky uhrazeného pojistného a jemu odpovídající měsíční vyměřovací základ." The table ("Uhrazená platba", "2,7 % z měsíčního vyměřovacího základu") gives:

  | Monthly base (Kč) | Premium (Kč) |
  | --- | --- |
  | 9 000 | 243 |
  | 19 710 | 533 |
  | 24 484 | 662 |
  | 28 050 | 758 |
  | 42 900 | 1 159 |

- **Inputs:** each monthly base; rate 2,7 %; sickness eligibility threshold 4 500 Kč (2026).
- **Expected:** the premium in each row; minimum base 9 000 Kč.
- **Tests:** `ČSSZ: voluntary OSVČ sickness insurance 2026` → `a monthly base of %i Kč pays %i Kč a month` (five cases) and `the minimum base is 9 000 Kč…`. Result: pass.

## E7 ČSSZ: sickness reduction thresholds 2026

- **Source:** ČSSZ, "Výše a výpočet dávek", same section as E6.
- **Czech:** "do 1 633 Kč se započítává ve výši 90 %, nad 1 633 Kč do 2 449 Kč redukce na 60 %, nad 2 449 Kč do 4 897 Kč redukce na 30 %, nad 4 897 Kč se nezohledňuje."
- **Expected:** thresholds 1 633, 2 449 and 4 897 Kč.
- **Test:** `ČSSZ: sickness benefit reduction thresholds 2026` → `first, second and third reduction thresholds are 1 633, 2 449 and 4 897 Kč`. Result: pass.

## E8 ČSSZ: sickness benefit, Příklad č. 2 (OSVČ, 2026)

- **Source:** ČSSZ, "Výše a výpočet dávek", section "Příklad č. 2" (same page as E6).
- **Czech:** "Vyměřovací základ pro výpočet dávky je 16 296 x 12 (12 je počet měsíců účasti na NP) = VZ 195 552 Kč. DVZ pro dávku činí 535,76 Kč (195 552 : 365). DVZ se redukuje dle výše uvedených hranic, tj. redukce ve výši první redukční hranice 90 % činí 482,18 Kč, po zaokrouhlení na celé koruny nahoru činí 483 Kč. ... od 15. do 30. dne ... 60 % z redukovaného DVZ, tj. 290 Kč (483 x 0,60), od 31. do 60. dne ... 319 Kč (tzn. 66 % z redukovaného DVZ, 483 x 0,66) a od 61. dne ... 348 Kč (tzn. 72 % z redukovaného DVZ, 483 x 0,72)."
- **Note on the text:** the example gives the reference period as "duben 2005 až březen 2026"; the months are April 2025 to March 2026 (the premiums listed are for 4/2025–3/2026).
- **Inputs:** monthly base 16 296 Kč for twelve insured months; 2026 thresholds 1 633 / 2 449 / 4 897 Kč.
- **Expected:** daily base 535,76 Kč; first band 482,18 Kč; reduced daily base 483 Kč; daily benefit 290 / 319 / 348 Kč.
- **Test:** `ČSSZ: sickness benefit, Příklad č. 2` → `daily base 535,76 Kč, reduced to 483 Kč, daily benefit 290 / 319 / 348 Kč`. Calls `calculateSicknessBenefit` with the base directly. Result: pass.

## E9 ČSSZ: premium 440 Kč implies the base 16 296 Kč (D1)

- **Source:** ČSSZ, "Výše a výpočet dávek", Příklad č. 2 (same page).
- **Czech:** "Pojistné na NP za 4/2025 - 3/2026 á 440 Kč – měsíční VZ je 16 296 Kč."
- **Inputs:** monthly premium 440 Kč; rate 2,7 %.
- **Expected:** monthly base 16 296 Kč.
- **Test:** `ČSSZ: sickness benefit, Příklad č. 2` → `the monthly premium of 440 Kč implies the base 16 296 Kč` (it.fails). Actual: `osvcMonthlyAssessmentBaseFor` returns 16 297 Kč, which pays 441 Kč. See D1.

## E10 and E11 ČSSZ: sickness benefit, Příklad č. 3 and č. 1 (partial reference period, D2)

- **Source:** ČSSZ, "Výše a výpočet dávek", Příklad č. 3 and Příklad č. 1 (same page).
- **Czech, Příklad č. 3:** "Pojistné na NP za 1/2026 - 4/2026 á 662 Kč – měsíční VZ je 24 484 Kč. Vyměřovací základ pro výpočet dávky je 24 484 x 4 (4 je počet měsíců účasti na NP) = VZ 97 936 Kč. DVZ pro dávku činí 816,13 Kč (97 936 : 120). DVZ se redukuje ... 90 % činí 734,52 Kč, po zaokrouhlení na celé koruny nahoru činí 735 Kč." Benefits: "441 Kč (735 x 0,60)", "486 Kč (735 x 0,66)" and "530 Kč (735 x 0,72)". The reference period is "květen 2025 až duben 2026 = tj. 365 dnů", with 245 excluded days, so 120 days of insurance.
- **Czech, Příklad č. 1:** "Vyměřovací základ pro výpočet dávky je 9 000 x 4 (4 je počet měsíců účasti na NP) = VZ 36 000 Kč. Denní vyměřovací základ (dále jen „DVZ“) pro dávku činí 300 Kč (36 000 : 120). ... redukce ve výši první redukční hranice 90 % činí 270 Kč ... od 15. do 30. dne ... 162 Kč, od 31. do 60. dne ... 179 Kč ... a od 61. dne ... 195 Kč."
- **Inputs:** Příklad č. 3: 24 484 Kč for four months, divided by 120 days. Příklad č. 1: 9 000 Kč for four months, divided by 120 days.
- **Expected:** Příklad č. 3: daily base 816,13 Kč; reduced 735 Kč; benefits 441 / 486 / 530 Kč. Příklad č. 1: daily base 300 Kč; reduced 270 Kč; benefits 162 / 179 / 195 Kč.
- **Tests:** `ČSSZ: sickness benefit, Příklad č. 3 and č. 1` → `Příklad č. 3…` and `Příklad č. 1…` (both it.fails). Actual: 804,95 Kč (reduced 725; benefits 435 / 479 / 522) and 295,89 Kč (reduced 267; benefits 161 / 177 / 193). See D2.

## E12 Finanční správa: paušální daň 2025

- **Source:** Finanční správa, "Informace k institutu paušální daně pro rok 2025 a 2026", https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/pausalni-dan/informace-k-institutu-pausalni-dane-pro-rok-2025 (section "Výše měsíční zálohy na paušální daň pro rok 2025").
- **Czech:** table with the columns "Celková paušální platba", "Daň z příjmů", "Pojistné na důchodové pojištění", "Pojistné na zdravotní pojištění":

  | Band | Total | Income tax | SP | ZP |
  | --- | --- | --- | --- | --- |
  | I. pásmo | 8 716 Kč | 100 Kč | 5 473 Kč | 3 143 Kč |
  | II. pásmo | 16 745 Kč | 4 963 Kč | 8 191 Kč | 3 591 Kč |
  | III. pásmo | 27 139 Kč | 9 320 Kč | 12 527 Kč | 5 292 Kč |

- **Inputs:** average wage 2025 = 46 557 Kč; SP minimum share 35 %.
- **Expected:** 8 716 / 16 745 / 27 139 Kč a month; the parts add up to each total.
- **Tests:** `Finanční správa: paušální daň monthly amounts` → `2025: 8 716, 16 745 and 27 139 Kč a month…` and `2025 published parts add up…`. Result: pass.

## E13 Finanční správa: paušální daň 2026

- **Source:** the same Finanční správa page, section "Výše měsíční zálohy na paušální daň pro rok 2026".
- **Czech:** the same table for 2026: I. pásmo 9 162 Kč (100 / 5 756 / 3 306 Kč); II. pásmo 16 745 Kč (4 963 / 8 191 / 3 591 Kč); III. pásmo 27 139 Kč (9 320 / 12 527 / 5 292 Kč).
- **Inputs:** average wage 2026 = 48 967 Kč; SP minimum share 35 %.
- **Expected:** 9 162 / 16 745 / 27 139 Kč a month.
- **Tests:** `2026: 9 162, 16 745 and 27 139 Kč a month…` and `2026 published parts add up…`. Result: pass.

## E14 Finanční správa: paušální daň before and after the July 2026 correction

- **Source:** the same Finanční správa page, section "Změna paušálních záloh od 1. 7. 2026".
- **Czech:** "Od 1. července 2026 došlo ... ke snížení měsíční paušální zálohy z částky 9 984 Kč na částku 9 162 Kč, a to se zpětnou účinností od 1. 1. 2026. ... vznikne poplatníkům přeplatek v celkové výši 4 932 Kč. ... Namísto standardní částky 9 162 Kč postačí uhradit pouze 4 230 Kč."
- **Inputs:** average wage 2026 = 48 967 Kč; SP minimum share 40 % (the rate before the change).
- **Expected:** band 1 before the change 9 984 Kč. Overpayment (9 984 − 9 162) × 6 = 4 932 Kč; 9 162 − 4 932 = 4 230 Kč.
- **Tests:** `before 1 July 2026 band 1 was 9 984 Kč…` (`calculatePausalniDanMonthlyAmounts` at 40 %) and `the July 2026 correction…` (arithmetic on the published figures). Result: pass.

## E15 Finanční správa: credits, child credit and bonus minimum 2025

- **Source:** Finanční správa, "Pokyny k vyplnění přiznání k dani z příjmů fyzických osob za zdaňovací období 2025" (form 5405/1), https://adisspr.mfcr.cz/dpr/adis/idpr_pub/dpf/dp7/doc/pokyny_dap_2025.pdf, pages 3–4 (ř. 64–68, 72, 76).
- **Czech:**
  - ř. 64: "uveďte částku 30 840 Kč."
  - ř. 65a: "uveďte částku 24 840 Kč ročně"
  - ř. 66: "uveďte částku 2 520 Kč ročně (210 Kč měsíčně)"
  - ř. 67: "uveďte částku 5 040 Kč ročně (420 Kč měsíčně)"
  - ř. 68: "uveďte částku 16 140 Kč ročně, pokud Vám byl přiznán nárok na průkaz ZTP/P."
  - ř. 72: "Nárok na daňové zvýhodnění činí 15 204 Kč ročně na jedno dítě (1 267 Kč měsíčně), 22 320 Kč ročně na druhé dítě (1 860 Kč měsíčně) a 27 840 Kč ročně na třetí a každé další dítě (2 320 Kč měsíčně). Jedná-li se o dítě, kterému je přiznán nárok na průkaz ZTP/P, zvyšuje se na ně částka daňového zvýhodnění na dvojnásobek."
  - ř. 76: "Daňový bonus můžete uplatnit při splnění podmínek stanovených v § 35c zákona, pokud jeho výše činí alespoň 100 Kč."
- **Expected:** the values above; child credit per year = 12 × monthly; a ZTP/P child doubles it.
- **Tests:** `Finanční správa: Pokyny k vyplnění přiznání k dani z příjmů FO 2025` → `credits: payer 30 840…`, `child credit 1 267, 1 860 and 2 320 Kč a month…`, `a child with a ZTP/P card doubles the child credit…` (calculator returns 2 × 15 204 = 30 408 Kč) and `the bonus is paid only from 100 Kč…`. Result: pass.

## E16 Finanční správa: solidarity threshold 2025

- **Source:** the same instructions, ř. 57, page 3.
- **Czech:** "(Pro rok 2025 je 36násobek průměrné mzdy podle nařízení vlády č. 282/2024 Sb., ... ve výši 1 676 052 Kč.)"
- **Expected:** 1 676 052 Kč (36 × 46 557).
- **Test:** `the 23 % rate starts above 36 × the average wage: 1 676 052 Kč in 2025`. Result: pass.

## E17 Finanční správa: tax base rounded down to hundreds

- **Source:** the same instructions, ř. 56, page 3.
- **Czech:** "ř. 56 Základ daně zaokrouhlený na celá sta Kč dolů – uveďte základ daně z ř. 55 zaokrouhlený na celá sta Kč dolů (např. 93 295 Kč zaokrouhleno na 93 200 Kč) podle § 16 zákona."
- **Inputs:** profit (base before rounding) 93 295 Kč, no deductions, 2025 rates.
- **Expected:** tax base 93 200 Kč.
- **Test:** `the tax base is rounded down to whole hundreds: 93 295 Kč becomes 93 200 Kč`. Result: pass.

---

## Disagreements

**D1: the monthly base implied by a premium (E9).** The calculator's `osvcMonthlyAssessmentBaseFor` takes `ceil(100 × premium ÷ 2,7)`. For a premium of 440 Kč that gives 16 297 Kč, and 16 297 × 2,7 % = 440,02, which rounds up to 441 Kč. The base the ČSSZ uses, 16 296 Kč, pays 440 Kč. The largest base that still pays 440 Kč is `floor(100 × premium ÷ 2,7)`. The effect in E9 is small: daily base 535,79 Kč instead of 535,76 Kč, and the daily benefits (483 / 290 / 319 / 348) are the same. The function feeds `calculateOsvcSicknessBenefit` and `calculateOsvcMaternityBenefit`, which the benefit comparison screen (`src/screens/benefits/compare-benefits.ts`) calls, so it can matter in other cases. Not changed here.

**D2: partial reference period (E10, E11).** The calculator takes monthly bases for twelve insured months and divides by 365 (`dailyAssessmentBaseFor`). ČSSZ excludes the months without insurance from the reference period and divides the bases of the insured months by the days of insurance in it (120 days for four months). The ČSSZ page states the rule: "Z rozhodného období musí být vyloučeny kalendářní měsíce, v nichž OSVČ nebyla účastna NP". The app prefills twelve months and 365 days (docs/legal-research/sickness-insurance.md, the OSVČ prefill), so an OSVČ who started during the reference period gets the wrong daily base. The example also needs the number of insured days, which the calculator does not take. A decision is needed (model the excluded days or show a warning); not changed here.

**Internal errors in the ČSSZ examples (not a calculator disagreement):**
- Příklad č. 1 gives the monthly premium in its header as 280 Kč, but its text uses 243 Kč (2,7 % of 9 000 Kč).
- Příklad č. 1 gives participation from 2 January 2026 but premiums paid for 1/2025–4/2026, and its excluded period "květen 2025 až prosinec 2026" does not match "120 days".
- Příklad č. 2 gives the reference period as "duben 2005 až březen 2026".

The tests use only the arithmetic lines, and the premium amounts in the text.

**Not a disagreement, but the comment needs a check:** the comment on `TAX_YEARS[2026]` in `src/data/tax-years.ts` says the 35 % minimum applies "retroactively for the whole year". ČSSZ says the advances change only from July 2026, and the annual 2026 premium is set on the 35 % minimum. The annual result (E4) matches the calculator. The comment could say that more precisely; not changed here.

---

## Not found

- **Maternity benefit (peněžitá pomoc v mateřství), numeric:** no numeric example for 2024–2026 on cssz.gov.cz (pages "Výše a výpočet dávek", "Peněžitá pomoc v mateřství", "Otcovská", "Mateřství - snadně a přehledně") or in the ČSSZ "Příručka pro nastávající rodiče 2023" (https://www.cssz.cz/documents/20143/1045843/P%C5%99%C3%ADru%C4%8Dka+pro+nast%C3%A1vaj%C3%ADc%C3%AD+rodi%C4%8De+2023.pdf). The handbook gives the method only and its reduction thresholds (1 345 / 2 017 / 4 033 Kč) are 2023 values. The method (70 % of the reduced daily base; bands 100 % / 60 % / 30 %) is in the ČSSZ "Výše a výpočet dávek" page. It is covered by the existing fixtures, not by a published example.
- **Employee net wage and tax advance, 2024–2026:** no official worked example found. The Finanční správa "Vzorový příklad na výpočet zálohy na daň" (https://financnisprava.gov.cz/cs/financni-sprava/novinky/novinky-2013/vzorovy-priklad-na-vypocet-zalohy-na-dan-u-poplatnika-na-ktereho-se-vztahuje-pri-vypoctu-zalohy-solidarni-zvyseni-dane) uses the 2013 law (superhrubá mzda, 7 % solidarity surcharge) and cannot be used with the 2024–2026 rates. Secondary sites (finance.cz, mesec.cz and others) are not sources.
- **Child bonus, worked example:** none in an official source. The bonus rules are in ř. 72–77a of the 2025 instructions and are tested through E15.
- **OSVČ tax-return worked example:** none in the 2025 instructions; the only example (ř. 62, employer's disability credit) is outside the scope of the calculators.
- **Přehled o příjmech a výdajích OSVČ 2025 (ČSSZ, Pokyny):** no worked example (no "příklad" in the text). Not used.
- **Paušální daň band changes 2024–2025 (Finanční správa, "Příklady"):** scenario descriptions with income figures but no computed amounts beyond the band amounts. Not used.
- **Other sources not used:** secondary calculations on finance.cz, e15.cz, rulecalc.com, money.cz and similar sites; the 2019 MPSV guide "Jak vyplnit přehled OSVČ" (method only, outdated).
