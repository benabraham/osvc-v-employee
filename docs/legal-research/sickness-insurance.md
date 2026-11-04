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

## Benefits (dávky) in the app

The benefits screen (`#/benefits`) compares what an employee and a self-employed person (OSVČ) receive for the same monthly income, and who qualifies for each benefit. The calculators are in `src/calc/benefits.ts` and `src/calc/benefit-eligibility.ts`. The comparison is in `src/screens/benefits/compare-benefits.ts` and the eligibility answers in `src/screens/benefits/eligibility-verdicts.ts`.

### Statute references the code uses

The table was checked on 4 November 2026 against the e-Sbírka texts that `pnpm esbirka` returns for zákon 187/2006 Sb. and zákon 262/2006 Sb. (zákoník práce). Rows marked "from the repo quotes" are quoted above in this file.

| Reference | Rule | Where in the code |
| --- | --- | --- |
| § 21 odst. 1 písm. a) | Sickness benefit (and carer's allowance): the daily base counts 90 % up to the first reduction threshold, 60 % up to the second, 30 % up to the third, nothing above | `sicknessBands` in `calc/benefits.ts` |
| § 21 odst. 1 písm. b) | Maternity and paternity benefit: the same bands at 100 %, 60 % and 30 % | `calculateMaternityBenefit` |
| § 22 odst. 1 | First threshold: one thirtieth of the general assessment base × conversion coefficient; second: 1.5 × first; third: 3 × first | `reductionThresholds` in the year data (`src/data/tax-years.ts`) |
| § 29 odst. 1 | Sickness benefit per calendar day: 60 % of the daily base up to day 30, 66 % from day 31 to day 60, 72 % from day 61 | `calculateSicknessBenefit` |
| § 33 písm. a) and b) | Maternity benefit period: 28 weeks; 37 weeks after the birth of two or more children at once | `MATERNITY_WEEKS_SINGLE_BIRTH`, `MATERNITY_WEEKS_MULTIPLE_BIRTH` |
| § 37 | Maternity benefit per calendar day: 70 % of the daily base | `calculateMaternityBenefit` (`× 0.7`) |
| § 38b odst. 1 | Paternity benefit period: two weeks, which the app counts as 14 calendar days | `PATERNITY_DAYS` |
| § 38c | Paternity benefit per calendar day: 70 % of the daily base | `calculateMaternityBenefit` (the same figure serves paternity) |
| § 6 odst. 2 | Eligibility threshold (rozhodný příjem). Twice this amount is the minimum monthly sickness base of an OSVČ | `sicknessEligibilityThreshold` in the year data |
| § 24, § 38a odst. 3 | OSVČ: 3 months of OSVČ insurance right before sickness or paternity benefit, unless it began within 8 days after an insured job that lasted its last 3 months | `isEligibleForOsvcSicknessBenefit`, `isEligibleForPaternityBenefit` |
| § 32 odst. 2–3 | Maternity: 270 insured days in the two years before; an OSVČ also needs 180 days of OSVČ insurance in the last year | `isEligibleForMaternityBenefit` |
| zákoník práce § 192 odst. 1 | The employer pays salary compensation for the first 14 calendar days of sickness, when the employee meets the sickness conditions | `EMPLOYER_COMPENSATION_CALENDAR_DAYS` |
| zákoník práce § 192 odst. 2 | Compensation is 60 % of the average earnings. The reduction thresholds are multiplied by 0.175 and rounded up to haléře | `hourlyReductionThresholdsFor`, `calculateSalaryCompensation` |
| zákoník práce § 356 odst. 1 | Average earnings are determined as average hourly earnings | `averageHourlyEarningsFor` |

The code's comment on the 70 % rate cites § 21 odst. 1 písm. b). That paragraph sets the reduction bands for maternity and paternity; the 70 % rate itself is in §§ 37 and 38c.

### How the screen compares

1. **Prefilled inputs.** The employee's gross is the gross equivalent of the active year. The OSVČ's monthly premium is the calculated voluntary sickness premium when that insurance is on in the calculation, else the year's minimum premium. Sickness lasts 30 calendar days. Insured days: 730 in the last two years. OSVČ days in the last year and OSVČ months before the claim: 365 and 12 when the insurance is on, else 0. "Continues from a job" is off. Nothing is saved.
2. **Employee, days 1–14: salary compensation.** Working days in the first calendar days = round(calendar days × 5 ÷ 7), so 14 days give 10 working days. Each is 8 hours, so 80 hours. Average hourly earnings = monthly gross × 12 ÷ (the year's working days × 8). The hourly thresholds are the daily thresholds × 0.175, rounded up to haléře. Compensation = 60 % of the reduced hourly earnings × hours, rounded up to whole crowns.
3. **Employee, from day 15: sickness benefit.** The daily assessment base is 12 × the monthly gross ÷ 365, rounded to cents. Reduced by the bands of § 21, then 60 %, 66 % or 72 % of it, rounded up, by the period in § 29. The benefit days are the calendar days minus 14.
4. **OSVČ, days 1–14: nothing.** From day 15 the same formula applies, on the OSVČ assessment base = premium × 100 ÷ 2.7 %, rounded up.
5. **Maternity and paternity.** Maternity: weeks × 7 × the daily benefit (70 % of the reduced daily base, bands at 100 / 60 / 30 %). Paternity: 14 × the daily benefit.
6. **Eligibility.** The screen lists yes or no for each benefit and each side, with the missing conditions. The employee has no waiting period for sickness.

### Assumptions in the code

- The employee always meets the sickness conditions of zákoník práce § 192 odst. 1. The verdict for employee sickness is always "yes".
- The monthly gross is the assessment base for both sides. The statutory assessment base, which the act derives from earnings over the previous period, is not computed.
- Benefit periods count calendar days. The working days in the first 14 days are approximated as 5 ÷ 7 of the calendar days.
- The 14-day employer period and the 8-hour working day are fixed. The hourly earnings use the working days of the year from the calculation.
- The hourly thresholds are not in the year data. They are derived from the daily ones (see `calc-port-notes.md`).
- Not modelled: the 50 % reductions of zákoník práce § 192 odst. 4 and of § 31 of the act (for example a brawl, intoxication or an intentional crime); the 22- and 31-week maternity periods of § 33 písm. c) and d); pensions.
- Carer's allowance (`calculateCarersAllowance`) is calculated but not shown on the screen.
- The eligibility answers are indicative. The ČSSZ decides.
