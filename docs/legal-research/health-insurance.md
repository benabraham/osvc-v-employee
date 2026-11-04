# Health insurance (zákon č. 592/1992 Sb.)

## Employee minimum base

> **§ 3 odst. 4**: (4) Pojistné za zaměstnance se stanoví z vyměřovacího základu podle odstavců 1 až 3, nejméně však z minimálního vyměřovacího základu, není-li dále stanoveno jinak.
>
> — [zákon č. 592/1992 Sb., o pojistném na veřejné zdravotní pojištění](https://www.zakonyprolidi.cz/cs/1992-592), Aktuální znění 01.11.2026 (verze 64)

> **§ 3 odst. 6**: (6) Minimálním vyměřovacím základem je minimální mzda.
>
> — [zákon č. 592/1992 Sb., o pojistném na veřejné zdravotní pojištění](https://www.zakonyprolidi.cz/cs/1992-592), Aktuální znění 01.11.2026 (verze 64)

> **§ 3 odst. 10**: (10) Pokud je vyměřovací základ zaměstnance nižší než minimální vyměřovací základ, je zaměstnanec povinen doplatit zdravotní pojišťovně prostřednictvím svého zaměstnavatele pojistné ve výši 13,5 % z rozdílu těchto základů.
>
> — [zákon č. 592/1992 Sb., o pojistném na veřejné zdravotní pojištění](https://www.zakonyprolidi.cz/cs/1992-592), Aktuální znění 01.11.2026 (verze 64)

An employee earning below the minimum wage tops up 13.5 % of the difference. `calculateEmployeeNetWage`, tested in `employee-net-wage.law.test.ts`. The reference library dropped this from 2024.

## OSVČ minimum base

> **§ 3a odst. 2**: Minimálním vyměřovacím základem se rozumí dvanáctinásobek 50 % průměrné mzdy; za průměrnou mzdu se pro účely tohoto zákona považuje částka, která se vypočte jako součin všeobecného vyměřovacího základu pro účely důchodového pojištění za kalendářní rok, který o dva roky předchází kalendářnímu roku, pro který se průměrná mzda zjišťuje, a přepočítacího koeficientu pro úpravu tohoto všeobecného vyměřovacího základu16b) s tím, že vypočtená částka se zaokrouhluje na celé koruny nahoru.
>
> — [zákon č. 592/1992 Sb., o pojistném na veřejné zdravotní pojištění](https://www.zakonyprolidi.cz/cs/1992-592), Aktuální znění 01.11.2026 (verze 64)

`calculateOsvcMinimums`, `calculateOsvcHealthInsurance` (13.5 % of half the profit, at least the minimum).

## Paušální daň, health part

> **§ 3a odst. 5**: (5) Vyměřovacím základem osoby samostatně výdělečně činné, jejíž daň z příjmů je rovna paušální dani pro zvolené pásmo paušálního režimu, je pro a) první pásmo paušálního režimu minimální vyměřovací základ podle odstavce 2, b) druhé pásmo paušálního režimu částka 319200 Kč a c) třetí pásmo paušálního režimu částka 470400 Kč.
>
> — [zákon č. 592/1992 Sb., o pojistném na veřejné zdravotní pojištění](https://www.zakonyprolidi.cz/cs/1992-592), Aktuální znění 01.11.2026 (verze 64)
