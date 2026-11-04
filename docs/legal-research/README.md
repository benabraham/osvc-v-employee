# Legal research

What the calculators in `src/calc` rely on, with the statute text quoted word for word so anyone can check it.
Each file lists the rule, the quote, the official numbers and the function and test that implement it.

| File | Covers |
| --- | --- |
| [income-tax.md](income-tax.md) | Flat-rate expenses, deductions, tax rates, credits, child bonus, paušální daň |
| [health-insurance.md](health-insurance.md) | OSVČ and employee health insurance minimums |
| [social-insurance.md](social-insurance.md) | OSVČ pension insurance minimums and maximum, sickness insurance rate |
| [sickness-insurance.md](sickness-insurance.md) | Employee eligibility threshold, benefit waiting periods and maternity eligibility |
| [year-values.md](year-values.md) | Average wage, minimum wage and the amounts published for each year |

## Sources and versions

The quotes were taken from these consolidated texts on 4 November 2026:

| Act | Version | Link |
| --- | --- | --- |
| zákon č. 586/1992 Sb., o daních z příjmů | Aktuální znění 01.08.2026 - 31.12.2026 (verze 157) | [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/1992-586) |
| zákon č. 592/1992 Sb., o pojistném na veřejné zdravotní pojištění | Aktuální znění 01.11.2026 (verze 64) | [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/1992-592) |
| zákon č. 589/1992 Sb., o pojistném na sociální zabezpečení a příspěvku na státní politiku zaměstnanosti | Aktuální znění 01.11.2026 - 31.12.2026 (verze 76) | [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/1992-589) |
| zákon č. 187/2006 Sb., o nemocenském pojištění | Aktuální znění 01.11.2026 - 31.12.2026 (verze 67) | [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2006-187) |
| zákon č. 427/2011 Sb., o doplňkovém penzijním spoření | Aktuální znění 01.08.2026 (verze 20) | [zakonyprolidi.cz](https://www.zakonyprolidi.cz/cs/2011-427) |

The amounts for a given year come from the state bodies that publish them (VZP, ČSSZ, MPSV, Finanční správa) and the government regulations (nařízení vlády). Each is linked where it is used.

## How to re-check

1. Open the linked act at the version shown and find the quoted paragraph.
2. Compare the numbers with the tests named next to each rule (`pnpm test` runs them all).
3. When a new year's values are published, add them to [year-values.md](year-values.md) and to the tests, then run the tests.
