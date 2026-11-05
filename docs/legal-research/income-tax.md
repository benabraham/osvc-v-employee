# Income tax (zákon č. 586/1992 Sb.)

## Flat-rate expenses (výdajový paušál)

> **§ 7 odst. 7**: (7) Neuplatní-li poplatník výdaje prokazatelně vynaložené na dosažení, zajištění a udržení příjmu, může uplatnit výdaje, s výjimkou uvedenou v § 12, ve výši a) 80 % z příjmů ze zemědělské výroby, lesního a vodního hospodářství a z příjmů z živnostenského podnikání řemeslného; nejvýše lze však uplatnit výdaje do částky 1600000 Kč, b) 60 % z příjmů ze živnostenského podnikání; nejvýše lze však uplatnit výdaje do částky 1200000 Kč, c) 30 % z příjmů z nájmu majetku zařazeného v obchodním majetku; nejvýše lze však uplatnit výdaje do částky 600000 Kč, d) 40 % z jiných příjmů ze samostatné činnosti, s výjimkou příjmů podle odstavce 1 písm. d) a odstavce 6; nejvýše lze však uplatnit výdaje do částky 800000 Kč.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

Implemented by `calculateFlatRateExpenses` in `src/calc/osvc-regimes.ts`. Each cap equals the rate × 2 000 000 Kč of income. Tested in `osvc-regimes.test.ts` ("flat-rate expenses").

## Deductions from the tax base (§ 15)

### Donations

> **§ 15 odst. 1**: (1) Od základu daně lze odečíst hodnotu bezúplatného plnění poskytnutého obcím, krajům, organizačním složkám státu, právnickým osobám se sídlem na území České republiky, jakož i právnickým osobám, které jsou pořadateli veřejných sbírek podle zvláštního zákona,14e) a to na vědu a vzdělávání, výzkumné a vývojové účely, kulturu, školství, na policii, na požární ochranu, na podporu a ochranu mládeže, na ochranu zvířat a jejich zdraví, na účely sociální, zdravotnické a ekologické, humanitární, charitativní, náboženské pro registrované církve a náboženské společnosti, tělovýchovné a sportovní, a politickým stranám, politickým hnutím, evropským politickým stranám nebo evropským politickým nadacím na jejich činnost, dále fyzickým osobám s bydlištěm na území České republiky, které jsou poskytovateli zdravotních služeb nebo provozují školy a školská zařízení a zařízení pro péči o toulavá nebo opuštěná zvířata nebo pro péči o jedince ohrožených druhů živočichů, na financování těchto zařízení, dále fyzickým osobám s bydlištěm na území České republiky, které jsou poživateli invalidního důchodu nebo byly poživateli invalidního důchodu ke dni přiznání starobního důchodu nebo jsou nezletilými dětmi závislými na péči jiné osoby podle zvláštního právního předpisu4j), na zdravotnické prostředky114) nejvýše do částky nehrazené zdravotními pojišťovnami nebo na zvláštní pomůcky podle zákona upravujícího poskytování dávek osobám se zdravotním postižením nejvýše do částky nehrazené příspěvkem ze státního rozpočtu a na majetek usnadňující těmto osobám vzdělání a zařazení do zaměstnání, pokud úhrnná hodnota bezúplatných plnění ve zdaňovacím období přesáhne 2 % ze základu daně anebo činí alespoň 1000 Kč. … V úhrnu lze odečíst nejvýše 15 % ze základu daně; to neplatí pro zdaňovací období kalendářních let 2020 a 2021, za která lze v úhrnu odečíst vždy nejvýše 30 % základu daně.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

Donations count only when they exceed 2 % of the tax base or reach 1 000 Kč, up to 15 % of the base. `deductibleDonationsFor`, tested in `osvc-income-tax.law.test.ts`. The reference library had no floor or cap.

Blood and organ donations are valued as donations in the same paragraph:

> **§ 15 odst. 1 (oceňení odběrů)**: Jako bezúplatné plnění na zdravotnické účely se hodnota jednoho odběru krve nebo jejích složek dárce, kterému nebyla poskytnuta finanční úhrada výdajů spojených s odběrem krve nebo jejích složek podle zákona upravujícího specifické zdravotní služby, s výjimkou úhrady prokázaných cestovních nákladů spojených s odběrem, oceňuje částkou 3 000 Kč, hodnota odběru orgánu od žijícího dárce se oceňuje částkou 20 000 Kč … a hodnota odběru krvetvorných buněk … se oceňuje částkou 20 000 Kč.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), znění od 1. 1. 2026 (e-Sbírka, `pnpm esbirka /sb/1992/586/2026-01-01`)

The model adds 3 000 Kč for each unpaid blood donation and 20 000 Kč for each organ or stem-cell donation to the money donations (`computeResults` in `src/model/compute.ts`); the 2 % floor and 15 % cap then apply to the total.

### Housing loan interest

> **§ 15 odst. 4**: Úhrn částek úroků ze všech úvěrů poplatníků v téže společně hospodařící domácnosti a částek, které se rovnají úrokům ze všech úvěrů bytových družstev připadajících na podíl těchto poplatníků, o které se snižuje základ daně podle odstavce 3, nesmí překročit 150000 Kč. … Při placení úroků jen po část roku nesmí uplatňovaná částka překročit jednu dvanáctinu této maximální částky za každý měsíc placení úroků.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

For housing acquired before 2021 the earlier cap of 300 000 Kč stays (zákon č. 386/2020 Sb., čl. IV); old and new loans together never exceed 300 000 Kč, and the newer loan counts first. Source: [Finanční správa, change of the interest limit](https://financnisprava.gov.cz/assets/cs/prilohy/d-seznam-dani/Informace-ke-zmene-vyse-limitu-uhrnne-castky-uroku.pdf).

Interest paid for part of the year is prorated by months (the `mortgageInterestMonths` option, 12 by default). The proration sentence is written in § 15 odst. 4 for the 150 000 Kč cap; the calculator applies the same twelfth to the 300 000 Kč combined cap for older housing, because the transitional article does not repeat the sentence. **Check with Finanční správa before relying on the older-housing figure for a part-year.** `deductibleMortgageInterestFor`, tested in `osvc-income-tax.law.test.ts` ("housing loan interest prorated by months").

### Retirement products and long-term care insurance

> **§ 15 odst. 6**: (6) Od základu daně lze odečíst příspěvky v celkovém úhrnu nejvýše 48000 Kč zaplacené poplatníkem ve zdaňovacím období na jeho daňově podporované produkty spoření na stáří a daňově podporované pojištění dlouhodobé péče, jehož je pojistníkem. Příspěvkem na produkt spoření na stáří se rozumí také pojistné na soukromé životní pojištění a majetek připsaný ve prospěch dlouhodobého investičního produktu. Příspěvkem na pojištění dlouhodobé péče se rozumí pojistné na toto pojištění.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

> **§ 15 odst. 7**: (7) V případě příspěvků na penzijní připojištění se státním příspěvkem podle zákona upravujícího penzijní připojištění se státním příspěvkem a na doplňkové penzijní spoření podle zákona upravujícího doplňkové penzijní spoření lze odečíst od základu daně podle odstavce 6 pouze část měsíčního příspěvku, která převyšuje částku, od které náleží nejvyšší státní příspěvek podle zákona upravujícího penzijní připojištění se státním příspěvkem nebo zákona upravujícího doplňkové penzijní spoření.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

> **§ 14 odst. 2**: (2) Je-li výše měsíčního příspěvku účastníka a) 500 až 1699 Kč, činí výše měsíčního státního příspěvku 20 % z částky měsíčního příspěvku účastníka, b) 1700 a více Kč, činí výše měsíčního státního příspěvku částku 340 Kč.
>
> — [zákon č. 427/2011 Sb., o doplňkovém penzijním spoření](https://www.zakonyprolidi.cz/cs/2011-427), Aktuální znění 01.08.2026 (verze 20)

So pension savings count only above 1 700 Kč in each month. In 2024 the level was 1 000 Kč until June and 1 700 Kč from July, which gives the reference library's 16 200 Kč a year. `calculateRetirementProductsDeduction`.

### Abolished from 2024

§ 15 has only paragraphs 1–8 in the current text: donations, housing interest, retirement products. Union dues and further-education exam fees are no longer deductible, so the calculators have no inputs for them.

## Tax rates (§ 16)

> **§ 16**: § 16 Sazba a výpočet daně pro základ daně (1) Sazba daně činí a) 15 % pro část základu daně do 36násobku průměrné mzdy a b) 23 % pro část základu daně přesahující 36násobek průměrné mzdy. (2) Daň se vypočte ze základu daně sníženého o nezdanitelné části základu daně a o odčitatelné položky od základu daně a zaokrouhleného na celá sta Kč dolů, a to jako součet součinů příslušné části takového základu daně a sazby pro tuto část základu daně.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

`calculateOsvcIncomeTax` applies 15 % up to 36 × the average wage and 23 % above it; the employee advance uses 3 × the average wage a month (`calculateEmployeeNetWage`).

## Credits (§ 35ba, § 35bb)

> **§ 35ba odst. 1**: (1) Poplatníkům uvedeným v § 2 se daň vypočtená podle § 16, případně snížená podle § 35, 35a nebo § 35b za zdaňovací období snižuje o a) základní slevu ve výši 30 840 Kč na poplatníka, b) slevu na manžela, c) základní slevu na invaliditu ve výši 2 520 Kč, je-li poplatníkovi přiznán invalidní důchod pro invaliditu prvního nebo druhého stupně z důchodového pojištění podle zákona o důchodovém pojištění43) nebo zanikl-li nárok na invalidní důchod pro invaliditu prvního nebo druhého stupně z důvodu souběhu nároku na výplatu tohoto invalidního důchodu a starobního důchodu, d) rozšířenou slevu na invaliditu ve výši 5 040 Kč, je-li poplatníkovi přiznán invalidní důchod pro invaliditu třetího stupně nebo jiný důchod z důchodového pojištění podle zákona o důchodovém pojištění43), u něhož jednou z podmínek přiznání je, že je invalidní ve třetím stupni, zanikl-li nárok na invalidní důchod pro invaliditu třetího stupně z důvodu souběhu nároku na výplatu invalidního důchodu pro invaliditu třetího stupně a starobního důchodu nebo je poplatník podle zvláštních předpisů invalidní ve třetím stupni, avšak jeho žádost o invalidní důchod pro invaliditu třetího stupně byla zamítnuta z jiných důvodů než proto, že není invalidní ve třetím stupni, e) slevu na držitele průkazu ZTP/P ve výši 16 140 Kč, je-li poplatníkovi přiznán nárok na průkaz ZTP/P.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

> **§ 35bb odst. 1**: (1) Výše slevy na manžela činí 24840 Kč. Výše slevy se zvyšuje na dvojnásobek, pokud je sleva uplatňována na manžela, kterému je přiznán nárok na průkaz ZTP/P.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

Rates used: payer 30 840, spouse 24 840, disability 2 520 and 5 040, ZTP/P 16 140 Kč a year. The spouse credit doubles when the spouse holds a ZTP/P card (`spouseHasZtpP` in `calculateOsvcIncomeTax`, `credits.spouseHasZtpP` in the inputs; the employee side has no spouse credit). The statute places the rule in § 35bb odst. 1; § 35ba odst. 1 písm. b) only names the credit.

## Child credit and bonus (§ 35c)

> **§ 35c odst. 1**: (1) Poplatník uvedený v § 2 má nárok na daňové zvýhodnění na vyživované dítě žijící s ním ve společně hospodařící domácnosti na území členského státu Evropské unie nebo státu tvořícího Evropský hospodářský prostor (dále jen "daňové zvýhodnění") ve výši 15204 Kč ročně na jedno dítě, 22320 Kč ročně na druhé dítě a 27840 Kč ročně na třetí a každé další dítě, pokud neuplatňuje slevu na dani podle § 35a nebo § 35b. Poplatník o daňové zvýhodnění sníží daň vypočtenou podle § 16, případně sníženou podle § 35, § 35ba. Daňové zvýhodnění může poplatník uplatnit formou slevy na dani, daňového bonusu nebo slevy na dani a daňového bonusu. Je-li v jedné společně hospodařící domácnosti více vyživovaných dětí poplatníka, posuzují se pro účely tohoto ustanovení dohromady.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

> **§ 35c odst. 3**: (3) Je-li nárok poplatníka na daňové zvýhodnění podle odstavce 1 vyšší než daň vypočtená podle § 16 snížená o slevy na dani podle § 35 a 35ba, je vzniklý rozdíl daňovým bonusem. Poplatník může daňový bonus uplatnit, pokud jeho výše činí alespoň 100 Kč.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

> **§ 35c odst. 4**: (4) Daňový bonus může uplatnit poplatník, který ve zdaňovacím období měl příjem podle § 6 nebo 7 alespoň ve výši šestinásobku minimální mzdy.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

Monthly credits 1 267, 1 860 and 2 320 Kč (the yearly amounts ÷ 12). The bonus needs at least 6 × the minimum wage of § 6 or § 7 income and at least 100 Kč. `calculateOsvcIncomeTax` with `qualifyingIncome`, tested in `osvc-income-tax.law.test.ts`.

> **§ 35c odst. 7**: (7) Dočasný pobyt dítěte mimo společně hospodařící domácnost nemá vliv na uplatnění daňového zvýhodnění. Jedná-li se o dítě, kterému je přiznán nárok na průkaz ZTP/P, zvyšuje se na ně částka daňového zvýhodnění na dvojnásobek; maximální výše daňového bonusu podle odstavce 3 zůstává zachována.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), znění od 1. 1. 2026 (e-Sbírka, `pnpm esbirka /sb/1992/586/2026-01-01`)

A child with a ZTP/P card gets twice the credit for each month (`childrenDetail` with `hasZtpP`; the employee side in `calculateEmployeeNetWage` doubles the same way). The statute puts this rule in odstavec 7, not odstavec 1, and the 2026 wording has no bonus maximum in odstavec 3. The phrase "maximální výše daňového bonusu podle odstavce 3 zůstává zachována" refers to a maximum the text does not state, so the calculator sets no cap. **Open question for Dan:** whether a cap applies to the doubled bonus; it would bind only at very high child credits.

## New credits from 2027 (zákon č. 180/2026 Sb.)

> **§ 35ba odst. 1 písm. f)–h) (bod 15)**: 15. V § 35ba se na konci odstavce 1 tečka nahrazuje čárkou a doplňují se písmena f) až h), která znějí: „f) slevu na studenta, g) slevu za umístění dítěte, h) slevu na evidenci tržeb.“.
>
> — [zákon č. 180/2026 Sb., o evidenci tržeb a o změně některých dalších zákonů](https://www.zakonyprolidi.cz/cs/2026-180), Aktuální znění 08.10.2026 - 31.12.2026 (verze 1)

> **§ 35bc–35be (bod 18)**: § 35bc Sleva na studenta (1) Výše slevy na studenta činí 4020 Kč. (2) Slevu na studenta lze uplatnit pouze tehdy, pokud a) se poplatník soustavně připravuje na budoucí povolání, až do dovršení věku 26 let nebo b) poplatník studuje v prezenční formě studia v doktorském studijním programu, který poskytuje vysokoškolské vzdělání, až do dovršení věku 28 let. (3) Soustavnou přípravou na budoucí povolání se pro účely daní z příjmů rozumí soustavná příprava dítěte na budoucí povolání podle zákona upravujícího státní sociální podporu. § 35bd Sleva za umístění dítěte (1) Výše slevy za umístění dítěte je rovna výši výdajů prokazatelně poplatníkem vynaložených za umístění jím vyživovaného dítěte v předškolním zařízení na dané zdaňovací období. Za každé vyživované dítě lze uplatnit slevu maximálně ve výši minimální mzdy. (2) Žije-li vyživované dítě ve více společně hospodařících domácnostech, maximální výše slevy, kterou je poplatník oprávněn uplatnit, je rovna podílu minimální mzdy a počtu těchto společně hospodařících domácností. Poplatníci se mohou písemně dohodnout na jiném způsobu stanovení maximální výše slevy, kterou je každý z nich na vyživované dítě oprávněn uplatnit, tak, aby úhrn takto stanovených maximálních výší slev byl roven minimální mzdě. Maximální výše slevy podle tohoto odstavce se zaokrouhluje na celé koruny dolů. (3) Vyživuje-li dítě v jedné společně hospodařící domácnosti více poplatníků, může slevu za umístění dítěte uplatnit za zdaňovací období jen jeden z nich. (4) Slevu za umístění dítěte lze uplatnit pouze tehdy, pokud a) žije dítě s poplatníkem ve společně hospodařící domácnosti alespoň po část zdaňovacího období a b) nebyly výdaje prokazatelně vynaložené za umístění vyživovaného dítěte v předškolním zařízení uplatněny poplatníkem jako výdaj na dosažení, zajištění a udržení zdanitelných příjmů. (5) Pro účely slevy za umístění dítěte se za vyživované dítě poplatníka nepovažuje vlastní vnuk nebo vnuk druhého z manželů, není-li v péči těchto osob, která nahrazuje péči rodičů. (6) Pro účely daní z příjmů se předškolním zařízením rozumí a) mateřská škola podle školského zákona nebo obdobné zařízení v zahraničí, b) zařízení služby péče o dítě v dětské skupině podle zákona upravujícího poskytování služby péče o dítě v dětské skupině nebo obdobné zařízení v zahraničí a c) zařízení péče o dítě předškolního věku provozované na základě živnostenského oprávnění, pokud charakter takto poskytované péče je srovnatelný s péčí poskytovanou 1. zařízením služby péče o dítě v dětské skupině podle zákona upravujícího poskytování služby péče o dítě v dětské skupině, nebo 2. mateřskou školou podle školského zákona. § 35be Sleva na evidenci tržeb (1) Výše slevy na evidenci tržeb činí a) 5000 Kč, b) částku ve výši kladného rozdílu mezi 15 % dílčího základu daně ze samostatné činnosti a základní slevou na poplatníka, je-li tento rozdíl nižší než 5000 Kč, nebo c) 0 Kč, je-li rozdíl mezi 15 % dílčího základu daně ze samostatné činnosti a základní slevou na poplatníka záporný nebo roven nule. (2) Slevu na evidenci tržeb lze uplatnit pouze v prvním zdaňovacím období, ve kterém poplatník zaevidoval tržbu, kterou má podle zákona upravujícího evidenci tržeb povinnost evidovat.“.
>
> — [zákon č. 180/2026 Sb., o evidenci tržeb a o změně některých dalších zákonů](https://www.zakonyprolidi.cz/cs/2026-180), Aktuální znění 08.10.2026 - 31.12.2026 (verze 1)

> **§ 36 (účinnost)**: Tento zákon nabývá účinnosti dnem 1. ledna 2027, s výjimkou ustanovení § 14, 15, 18, 21, 23, 25 a 26, která nabývají účinnosti dnem následujícím po dni jeho vyhlášení.
>
> — [zákon č. 180/2026 Sb., o evidenci tržeb a o změně některých dalších zákonů](https://www.zakonyprolidi.cz/cs/2026-180), Aktuální znění 08.10.2026 - 31.12.2026 (verze 1)

`calculateOsvcIncomeTax` takes `studentMonths`, `childPlacementFees` and `isFirstYearWithRegisteredSales`; the credits apply only when the year's rates define them (2027 onwards). Tested in `osvc-income-tax.law.test.ts` ("credits from 2027"). The employee monthly advance (`calculateEmployeeNetWage`) has the student credit through `rates.studentCredit`; školkovné and the sales registration credit are claimed in the yearly return, not monthly.

## Paušální daň

> **§ 2a odst. 5**: (5) Rozhodnými příjmy pro a) první pásmo paušálního režimu jsou příjmy ze samostatné činnosti do výše 1. 1000000 Kč, a to bez ohledu na to, z jaké samostatné činnosti plynou, 2. 1500000 Kč, pokud alespoň 75 % příjmů ze samostatné činnosti poplatníka tvoří příjmy, k nimž lze uplatnit výdaje ve výši 80 % z příjmů nebo 60 % z příjmů, a 3. 2000000 Kč, pokud alespoň 75 % příjmů ze samostatné činnosti poplatníka tvoří příjmy, k nimž lze uplatnit výdaje ve výši 80 % z příjmů, b) druhé pásmo paušálního režimu jsou příjmy ze samostatné činnosti do výše 1. 1500000 Kč, a to bez ohledu na to, z jaké samostatné činnosti plynou, a 2. 2000000 Kč, pokud alespoň 75 % příjmů ze samostatné činnosti poplatníka tvoří příjmy, k nimž lze uplatnit výdaje ve výši 80 % z příjmů nebo 60 % z příjmů, a c) třetí pásmo paušálního režimu jsou příjmy ze samostatné činnosti do výše 2000000 Kč, a to bez ohledu na to, z jaké samostatné činnosti plynou.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

> **§ 38lk odst. 7**: (7) Záloha poplatníka v paušálním režimu na daň z příjmů činí a) 100 Kč pro první pásmo paušálního režimu, b) 4963 Kč pro druhé pásmo paušálního režimu a c) 9320 Kč pro třetí pásmo paušálního režimu.
>
> — [zákon č. 586/1992 Sb., o daních z příjmů](https://www.zakonyprolidi.cz/cs/1992-586), Aktuální znění 01.08.2026 - 31.12.2026 (verze 157)

The insurance parts of each band are set in the insurance acts (see [health-insurance.md](health-insurance.md) and [social-insurance.md](social-insurance.md)). `pausalniDanBandFor`, `calculatePausalniDanMonthlyAmounts`; the published amounts are in [year-values.md](year-values.md).

## Donation cap 30 % for 2022–2026 (zákon 128/2022 Sb.)

§ 15 odst. 1 of zákon 586/1992 Sb. caps donations at 15 % of the tax base. A separate act raises it: zákon 128/2022 Sb. § 1 odst. 1, in the wording in force from 11 February 2025 (e-Sbírka, checked 5 November 2026):

> (1) Za zdaňovací období let 2022 až 2026 lze podle § 15 odst. 1 zákona o daních z příjmů od základu daně odečíst hodnotu bezúplatného plnění v úhrnu nejvýše 30 % ze základu daně.

Before 11 February 2025 the same provision covered only "roku 2022 a 2023"; the amendment extended it to 2024–2026, so the 2024 tax-return instructions (printed earlier) still say 15 %, while the 2025 instructions and Finanční správa's 2026 page say 30 % ("Maximální limit 30 % ze základu daně platí pro roky 2022 až 2026"). `TAX_YEARS` uses 30 % for 2024–2026 and 15 % from 2027 (tested in `src/data/tax-years.test.ts`). The reference library kept 15 %.
