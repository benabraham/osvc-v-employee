# Sickness insurance (zákon č. 187/2006 Sb.)

## Employee eligibility threshold (rozhodný příjem)

> **§ 6 odst. 2**: (2) Rozhodný příjem činí 4 500 Kč. Částka rozhodného příjmu se zvýší od 1. ledna kalendářního roku, pokud jedna desetina součinu všeobecného vyměřovacího základu stanoveného podle zákona o důchodovém pojištění, který o dva roky předchází tomuto kalendářnímu roku, a přepočítacího koeficientu stanoveného podle zákona o důchodovém pojištění pro úpravu tohoto všeobecného vyměřovacího základu bude po zaokrouhlení na celou pětisetkorunu směrem dolů vyšší než dosud platná částka rozhodného příjmu; rozhodný příjem se stanoví ve výši této desetiny po tomto zaokrouhlení. Výši rozhodného příjmu stanoveného podle věty druhé vyhlašuje Ministerstvo práce a sociálních věcí ve Sbírce zákonů a mezinárodních smluv sdělením.
>
> — [zákon č. 187/2006 Sb., o nemocenském pojištění](https://www.zakonyprolidi.cz/cs/2006-187), Aktuální znění 01.11.2026 - 31.12.2026 (verze 67)

4 000 Kč in 2024 ([ČSSZ 2024 overview](https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-pro-rok-2024)) and 4 500 Kč in 2025 and 2026 ([ČSSZ 2026 overview](https://www.cssz.gov.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026): "zůstává v roce 2026 ve výši 4 500 Kč"). `sicknessEligibilityThresholdFor`. The OSVČ minimum sickness base is twice this amount, so the minimum premium is 216 Kč in 2024 and 243 Kč in 2026, as ČSSZ publishes.

## OSVČ sickness benefit waiting period

> **§ 24**: § 24 Podmínkou nároku na nemocenské z pojištěné činnosti, která je samostatnou výdělečnou činností, je dále účast na pojištění jako osoby samostatně výdělečně činné podle § 11 alespoň po dobu 3 měsíců bezprostředně předcházející dni vzniku dočasné pracovní neschopnosti nebo dni, od něhož je nařízena karanténa; to však neplatí, vznikla-li osobě samostatně výdělečně činné účast na pojištění do 8 kalendářních dnů ode dne skončení zaměstnání, jestliže při výkonu tohoto zaměstnání byla účastna pojištění jako zaměstnanec alespoň v posledních 3 měsících trvání tohoto zaměstnání. Ustanovení věty první platí přiměřeně pro zahraničního zaměstnance.
>
> — [zákon č. 187/2006 Sb., o nemocenském pojištění](https://www.zakonyprolidi.cz/cs/2006-187), Aktuální znění 01.11.2026 - 31.12.2026 (verze 67)

`isEligibleForOsvcSicknessBenefit`, tested in `benefit-eligibility.test.ts`.

## Maternity benefit eligibility

> **§ 32 odst. 2**: (2) Podmínkou nároku na peněžitou pomoc v mateřství je účast pojištěnce na pojištění alespoň po dobu 270 kalendářních dní v posledních dvou letech přede dnem nástupu na peněžitou pomoc v mateřství (§ 34 odst. 1). Je-li uplatňován nárok na peněžitou pomoc v mateřství z více pojištění, musí být tato podmínka účasti na pojištění splněna v každém z těchto pojištění.
>
> — [zákon č. 187/2006 Sb., o nemocenském pojištění](https://www.zakonyprolidi.cz/cs/2006-187), Aktuální znění 01.11.2026 - 31.12.2026 (verze 67)

> **§ 32 odst. 3**: (3) Podmínkou nároku na peněžitou pomoc v mateřství osoby samostatně výdělečně činné je kromě splnění podmínky účasti na pojištění podle odstavce 2 účast na pojištění jako osoby samostatně výdělečně činné podle § 11 po dobu alespoň 180 kalendářních dnů v posledním roce přede dnem počátku podpůrčí doby stanovené podle § 34 odst. 1.
>
> — [zákon č. 187/2006 Sb., o nemocenském pojištění](https://www.zakonyprolidi.cz/cs/2006-187), Aktuální znění 01.11.2026 - 31.12.2026 (verze 67)

`isEligibleForMaternityBenefit`.

## OSVČ paternity benefit

> **§ 38a odst. 3**: (3) Podmínkou nároku na otcovskou osoby samostatně výdělečně činné je účast na pojištění jako osoby samostatně výdělečně činné podle § 11 alespoň po dobu 3 měsíců bezprostředně předcházející dni nástupu na otcovskou podle § 38b odst. 2; to však neplatí, vznikla-li osobě samostatně výdělečně činné účast na pojištění do 8 kalendářních dnů ode dne skončení zaměstnání, jestliže při výkonu tohoto zaměstnání byla účastna pojištění jako zaměstnanec alespoň v posledních 3 měsících trvání tohoto zaměstnání. Věta první se použije obdobně pro zahraničního zaměstnance.
>
> — [zákon č. 187/2006 Sb., o nemocenském pojištění](https://www.zakonyprolidi.cz/cs/2006-187), Aktuální znění 01.11.2026 - 31.12.2026 (verze 67)

`isEligibleForPaternityBenefit`.

## Benefit amounts

The amounts (sickness benefit 60 / 66 / 72 %, carer's allowance 60 %, maternity and paternity 70 % of the reduced daily base) are ported from the reference library and checked against its own test cases (`benefits.test.ts`). The reduction thresholds are published yearly by nařízení vlády.
