# Social insurance (zákon č. 589/1992 Sb.)

## OSVČ pension insurance base

> **§ 5b odst. 1**: (1) Vyměřovacím základem osoby samostatně výdělečně činné pro pojistné na důchodové pojištění a příspěvek na státní politiku zaměstnanosti je částka určená touto osobou, která činí nejméně 50 % daňového základu před rokem 2024 a od roku 2024 55 % daňového základu; daňovým základem se pro účely tohoto zákona rozumí dílčí základ daně z příjmů ze samostatné činnosti podle zákona o daních z příjmů, které jsou nebo by byly, pokud by podléhaly zdanění v České republice, předmětem daně z příjmů fyzických osob.
>
> — [zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti](https://www.zakonyprolidi.cz/cs/1992-589), Aktuální znění 01.11.2026 - 31.12.2026 (verze 76)

`calculateOsvcSocialInsurance` with `profitShare` 0.55 from 2024.

## Minimum monthly base and the new-OSVČ minimum

> **§ 14 odst. 5**: (5) Měsíční vyměřovací základ osoby samostatně výdělečně činné vykonávající hlavní samostatnou výdělečnou činnost činí nejméně 35 % průměrné mzdy. … V kalendářním roce, v němž osoba samostatně výdělečně činná vykonávající hlavní samostatnou výdělečnou činnost zahájila samostatnou výdělečnou činnost, a v bezprostředně následujících 2 kalendářních letech činí měsíční vyměřovací základ této osoby samostatně výdělečně činné nejméně 25 % průměrné mzdy; to však neplatí, pokud osoba samostatně výdělečně činná v období 20 kalendářních let před kalendářním rokem, v němž zahájila samostatnou výdělečnou činnost, již byla osobou samostatně výdělečně činnou.
>
> — [zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti](https://www.zakonyprolidi.cz/cs/1992-589), Aktuální znění 01.11.2026 - 31.12.2026 (verze 76)

`calculateOsvcMinimums` (with `isNewOsvc`) and `isNewOsvcFor`. ČSSZ figures: [minimum bases](https://www.cssz.gov.cz/vyse-minimalnich-vymerovacich-zakladu-osvc), [July 2026 change to 35 %](https://www.cssz.gov.cz/-/informace-pro-osvc-o-zmene-pojistneho-na-duchodove-pojisteni-od-1-7-2026).

## Paušální daň, pension part

> **§ 14 odst. 3**: (3) Výše měsíčního vyměřovacího základu osoby samostatně výdělečně činné, která je poplatníkem v paušálním režimu, činí pro a) první pásmo paušálního režimu částku nejnižšího měsíčního vyměřovacího základu podle odstavce 5 věty první zvýšeného o 15 %, b) druhé pásmo paušálního režimu 28050 Kč a c) třetí pásmo paušálního režimu 42900 Kč.
>
> — [zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti](https://www.zakonyprolidi.cz/cs/1992-589), Aktuální znění 01.11.2026 - 31.12.2026 (verze 76)

Finanční správa's published band 1 amounts match raising the minimum *premium* by 15 % and rounding up; raising the base first would give 1 Kč less in 2025. See [year-values.md](year-values.md).

## Maximum base

> **§ 15a odst. 1**: (1) Maximálním vyměřovacím základem zaměstnance pro placení pojistného je částka ve výši čtyřicetiosminásobku průměrné mzdy.
>
> — [zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti](https://www.zakonyprolidi.cz/cs/1992-589), Aktuální znění 01.11.2026 - 31.12.2026 (verze 76)


## Rates, including voluntary sickness insurance

> **§ 7 odst. 1**: (1) Sazby pojistného činí a) u zaměstnavatele 24,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. a), z toho 2,1 % na nemocenské pojištění, 21,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, b) u zaměstnavatele 1. v roce 2023 26,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. b), z toho 2,1 % na nemocenské pojištění, 23,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, 2. v roce 2024 27,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. b), z toho 2,1 % na nemocenské pojištění, 24,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, 3. v roce 2025 28,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. b), z toho 2,1 % na nemocenské pojištění, 25,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, 4. počínaje rokem 2026 29,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. b), z toho 2,1 % na nemocenské pojištění, 26,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, c) u zaměstnavatele 1. v roce 2025 26,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. c), z toho 2,1 % na nemocenské pojištění, 23,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, 2. v roce 2026 27,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. c), z toho 2,1 % na nemocenské pojištění, 24,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, 3. v roce 2027 28,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. c), z toho 2,1 % na nemocenské pojištění, 25,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, 4. počínaje rokem 2028 29,8 % z vyměřovacího základu stanoveného podle § 5a odst. 1 písm. c), z toho 2,1 % na nemocenské pojištění, 26,5 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, d) u zaměstnance 7,1 % z vyměřovacího základu, z toho 0,6 % na nemocenské pojištění a 6,5 % na důchodové pojištění, e) u osoby samostatně výdělečně činné 1. 29,2 % z vyměřovacího základu stanoveného podle § 5b odst. 1 až 3, z toho 28 % na důchodové pojištění a 1,2 % na státní politiku zaměstnanosti, jde-li o osobu samostatně výdělečně činnou účastnou důchodového pojištění, 2. 2,7 % z vyměřovacího základu stanoveného podle § 5b odst. 4, jde-li o osobu samostatně výdělečně činnou účastnou nemocenského pojištění, f) u osoby dobrovolně účastné na důchodovém pojištění 28 % z vyměřovacího základu, g) u zahraničního zaměstnance 2,7 % z vyměřovacího základu.
>
> — [zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti](https://www.zakonyprolidi.cz/cs/1992-589), Aktuální znění 01.11.2026 - 31.12.2026 (verze 76)

> **§ 5b odst. 4**: Měsíční základ však nemůže být nižší než dvojnásobek částky rozhodné podle předpisů o nemocenském pojištění pro účast zaměstnanců na nemocenském pojištění58a). … Měsíční základ osoby samostatně výdělečně činné, která je poplatníkem v paušálním režimu, nemůže být nižší než dvojnásobek částky rozhodné podle předpisů o nemocenském pojištění pro účast zaměstnanců na nemocenském pojištění a vyšší než měsíční vyměřovací základ osoby samostatně výdělečně činné, která je poplatníkem ve zvoleném pásmu paušálního režimu.
>
> — [zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti](https://www.zakonyprolidi.cz/cs/1992-589), Aktuální znění 01.11.2026 - 31.12.2026 (verze 76)

`calculateOsvcSicknessInsurance`: minimum monthly base twice the employee threshold from [sickness-insurance.md](sickness-insurance.md), 2.7 %, rounded up.
