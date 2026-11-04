# Uživatelská příručka: OSVČ vs. zaměstnanec

Aplikace odpovídá na dvě otázky:

1. **Jakému hrubému platu zaměstnance odpovídá to, co mi fakturování skutečně vynese?**
2. **Jak rozdělit každou fakturu, kterou pošlu?**

Aplikace běží v prohlížeči. Po prvním otevření funguje i offline a všechna data zůstávají v tomto zařízení. Adresa: https://benabraham.github.io/osvc-v-employee/

Výsledky jsou odhad, ne daňové poradenství.

Zkratky používané v aplikaci: **SP** = sociální pojištění, **ZP** = zdravotní pojištění, **NP** = nemocenské pojištění (dobrovolné, pro OSVČ), **DPH** = daň z přidané hodnoty.

---

## 1. Začínáte: nastavte výpočet

Rozdělení faktury počítá z hodinové sazby, pracovní doby a nákladů. Proto nejdřív zkontroluj výpočet.

1. Otevři **Výpočet** a zkontroluj **Fakturace** (dny, hodiny, sazba).
2. Otevři **Rozdělit fakturu**. Na obrazovce je karta **Nastav si nejdřív výpočet**.
3. Až bude výpočet v pořádku, klikni na **Hotovo, otevírat rovnou rozdělení faktury**.

Od té doby se aplikace po otevření ukáže rovnou na **Rozdělit fakturu**. Dokud nedokončíš nastavení, otevírá se **Výpočet**.

---

## 2. Navigace a hlavička

**Na telefonu** je dole lišta se čtyřmi obrazovkami: **Rozdělit fakturu**, **Výpočet**, **Náklady**, **Scénáře**. Tlačítko **Více** otevře zbylé: **Cílový příjem**, **Dávky**, **Data a sdílení**, **O aplikaci**.

**Na počítači** (od šířky 960 px) jsou všechny obrazovky v levém sloupci vedle obsahu.

V hlavičce jsou:

- **Daňový rok**: výběr roku ze čtyř v okně (viz kapitola 10). U každého roku je jeho druh: „minulý rok“, „aktuální“, „příští“.
- Odznaky **vlastní hodnoty** a **neověřeno** (viz kapitola 10).
- Přepínač jazyka **CS / EN**.
- **Motiv**: Podle systému, Světlý, Tmavý.

---

## 3. Rozdělit fakturu

Obrazovka odpovídá na otázku, kolik z faktury patří státu, na náklady a rezervu, a kolik můžeš utratit.

1. Zadej **Částku faktury**, nebo klikni na rychlou částku: 5 000, 10 000, 20 000, 50 000, 100 000 Kč.
2. Výsledek ukazuje pět řádků:

| Řádek | Co znamená |
| --- | --- |
| na daně, SP, ZP, NP | odvody a daň z příjmů, které připadají na tuto fakturu |
| na náklady | náklady podnikání z nákladového seznamu |
| na rezervu | rezerva na rok (měsíce rezervy) |
| na dovolenou | částka za dny dovolené |
| můžeš utratit | zbytek faktury |

Částky jsou zaokrouhlené na stovky. Pruh nahoře ukazuje totéž v barvách; každý díl má i popisek a částku.

Tlačítko **Kopírovat rozdělení** zkopíruje text s částkou faktury a všemi řádky.

Rozdělení nepočítá daň pro každou fakturu zvlášť. Používá roční podíly z výpočtu, takže souhlasí s roční kalkulací.

---

## 4. Výpočet

Obrazovka **Výpočet** je hlavní. Na telefonu je nahoře hlavní číslo, pod ním vstupy. Na počítači jsou vstupy vlevo a výsledky vpravo.

### 4.1 Výsledky

- **Čistého měsíčně**: hlavní číslo. Pod ním je **Odpovídá hrubé mzdě** (hrubý ekvivalent) a změna oproti loňsku při stejných vstupech („{změna} oproti {rok}“).
- **Paušální daň**: jeden řádek. Buď „by se ti vyplatila o … ročně“, nebo „by se nevyplatila, stála by o … víc“, nebo „není k dispozici, protože fakturace je nad 2. pásmem“. Porovnává se se zdaněním podle běžných pravidel, včetně slev a odpočtů, které by v paušálu přepadly.
- **Varování** (kapitola 13).
- **Podrobný výpočet**: fakturováno za rok, daňově uznatelné výdaje, základ daně, daň z příjmů, ZP, SP, dobrovolné nemocenské, odvody celkem, po zdanění, náklady, po zdanění a nákladech, dny pro výpočet (pracovní dny + rezerva), rezerva za rok, dovolená za rok, čistý roční a měsíční příjem, na den.
- **Hrubá mzda zaměstnance (odhad)** je sbalená. Ukazuje hrubou mzdu, SP a ZP zaměstnance, nemocenské, zálohu na daň, slevy, daňový bonus a čistou mzdu. Hrubá mzda je přibližná, protože se počítá po krocích a hledá se nejnižší hrubá mzda, jejíž čistá mzda dosáhne tvého čistého příjmu. Počítají se stejné osobní slevy jako u OSVČ.

### 4.2 Fakturace

| Pole | Význam |
| --- | --- |
| Pracovní dny za rok | Dny v roce, kdy pracuješ. Bez úpravy platí výchozí počet pro daný rok. Tlačítko **Použít výchozí** ho vrátí. |
| Dny dovolené | Dny dovolené nebo jinak nezaplacené. Nefakturuješ je; na ně si odkládáš částku z denní sazby. |
| Hodin práce za den | Včetně nefakturovatelných hodin. |
| Nefakturovatelné hodiny za rok | Vše, co zaměstnanec neřeší: fakturace, účetnictví a podobně. |
| Hodinová sazba | Kč za fakturovanou hodinu. |

Počítá se: dny k fakturaci, fakturovatelné hodiny za rok a fakturace za rok.

### 4.3 Stát a odvody

- **Uplatňuji paušální daň**: paušální daň místo daně z příjmů a pojistného. Při paušální dani se slevy a odpočty neuplatní.
- **Příplatek místo evidence tržeb**: jen u paušální daně a jen od roku 2027, v 1. pásmu, 1 400 Kč měsíčně.
- **Výdajový paušál**: 30, 40, 60 nebo 80 %. Podle něj se počítají uznatelné výdaje. Nápověda ukazuje, která činnost patří do které sazby.
- **Nový OSVČ**: v roce zahájení a ve dvou následujících letech je nižší minimální základ SP.
- **Daňově uznatelné výdaje**: vypočtené podle výdajového paušálu. Můžeš je přepsat (kapitola 4.4).
- **Dobrovolné nemocenské pojištění**: zapni, pokud ho platíš. Měsíční vyměřovací základ se předvyplní minimem roku. Tlačítko **Použít minimum** vrátí minimum.
- **Odvody celkem**: součet odvodů. Můžeš ho přepsat (kapitola 4.4).

### 4.4 Přepsané hodnoty (dříve modré buňky)

Ve staré tabulce byly hodnoty, které se dají přepsat, modře. V aplikaci jsou to dvě políčka: **Daňově uznatelné výdaje** a **Odvody celkem**.

- Přepsaná hodnota má štítek **upraveno** a tlačítko **Vrátit výpočet**.
- Tlačítko vrátí vypočtenou hodnotu a přepočítá všechno, co na ní závisí.
- Přepsaná hodnota platí pro všechny výsledky a pro rozdělení faktury. Řádek porovnání s paušální daní (kapitola 4.1) počítá s hodnotami bez přepsání.

Hledání cílové sazby (kapitola 7) přepsané hodnoty při výpočtu ignoruje.

### 4.5 Slevy a odpočty

Karta je sbalená. Shrnutí ukazuje slevy a odpočty, které se uplatní. Otevři ji tlačítkem nadpisu.

**Slevy na dani**:

- **Děti**: **Přidat dítě**. U každého dítěte zadáš:
  - **Měsíce, za které se sleva uplatní** (0 až 12);
  - **Dítě má průkaz ZTP/P**: sleva se zdvojnásobí;
  - **Školkovné za rok** (od roku 2027): uplatní se nejvýš do výše minimální mzdy na dítě.
  - Každé dítě se odebere tlačítkem **Odebrat**.
  - Měsíční sleva je podle pořadí dítěte: 1. dítě, 2. dítě, 3. a další.
- **Sleva na manžela nebo manželku**: uplatní se, když partner pečuje o dítě do 3 let a vydělá nejvýš 68 000 Kč ročně. Pokud má partner průkaz ZTP/P, sleva se zdvojnásobí.
- **Invalidita**: ne, I. nebo II. stupeň, III. stupeň. Každý stupeň má svou roční slevu.
- **Držím průkaz ZTP/P**.
- **Měsíce studia** (od roku 2027): jedna dvanáctina roční slevy za každý měsíc.
- **První rok s evidencí tržeb** (od roku 2027): sleva až 5 000 Kč, nejvýš 15 % základu minus základní sleva.

**Odpočty od základu daně**:

- **Dary**: peněžité dary za rok. Uznají se nad 2 % základu nebo od 1 000 Kč, nejvýš do 15 % základu.
- **Odběry krve**: každý odběr se počítá jako dar 3 000 Kč.
- **Odběry orgánů nebo kmenových buněk**: každý odběr se počítá jako dar 20 000 Kč.
- **Úroky z hypotéky (od 2021)**: strop 150 000 Kč za rok.
- **Úroky z hypotéky (před 2021)**: strop 300 000 Kč za rok včetně úroků z úvěrů od roku 2021.
- **Měsíce placení úroků**: když úroky platíš jen část roku, strop se krátí na jednu dvanáctinu za každý měsíc.
- **Penzijní spoření, DIP a životní pojištění**: strop 48 000 Kč za rok dohromady.

Stropy a částky slev jsou z dat daného roku, takže se mohou mezi roky lišit. Co se v daném roce uplatňuje, ukazuje výpočet: například studium a školkovné se objeví až od roku 2027.

### 4.6 Rezerva

- **Rezerva na rok**: kolik měsíců rezervy si odkládáš každý rok. Výchozí je 1,5 měsíce. Nápověda připomíná, že to odpovídá odstupnému, které může dostat zaměstnanec při výpovědi po dvou a více letech.
- Odkaz **Upravit náklady** otevře náklady (kapitola 5).

---

## 5. Náklady

Obrazovka **Náklady** nahrazuje náklady z tabulky. Jsou to skutečné náklady, které platíš z peněz po zdanění. Hardware rozpočítej na dobu, kdy ho budeš používat.

Každý řádek má:

- **Název**;
- **Cena** v Kč;
- **Na kolik měsíců** (odpisy): cena se rozpočítá na tolik měsíců. Roční náklad je cena × 12 ÷ měsíce.
- **Ročně**: vypočtený roční náklad.

Tlačítko **Přidat náklad** přidá řádek. Tlačítko **Smazat** řádek odebere a aplikace nabídne zprávu **Smazáno: …** s tlačítkem **Zpět**.

Dole jsou **Celkem za rok** a **Podíl z fakturace**. Výchozí náklady tabulky: hardware 60 000 Kč na 36 měsíců, software 1 000 Kč na 1 měsíc, účetní 5 000 Kč na 12 měsíců, vzdělávání (knihy, konference) 10 000 Kč na 12 měsíců. Dohromady je to 47 000 Kč za rok.

---

## 6. Scénáře

Scénář je uložený výpočet: sazba, výdaje, slevy a rok. Hodí se pro porovnání, například 650 a 800 Kč/h, nebo dvou způsobů podnikání.

1. Nastav výpočet tak, jak ho chceš uložit.
2. V kartě **Uložit aktuální výpočet** zadej **Název scénáře**. Výchozí název je například „650 Kč/h, 2026“.
3. Klikni na **Uložit scénář**.

Uložené scénáře jsou v seznamu **Uložené scénáře**. Každý má tlačítka:

- **Načíst**: přepne na rok scénáře a nastaví jeho vstupy jako aktuální.
- **Smazat**: odebere scénář.

Název můžeš přepsat přímo v seznamu, v poli u scénáře.

Karta **Porovnání** ukazuje aktuální výpočet a všechny scénáře vedle sebe. Řádky jsou rok, hodinová sazba, výdajový paušál, paušální daň, fakturace za rok, odvody a daň celkem, čistý příjem měsíčně, hrubý ekvivalent měsíčně a čistě za den. Nejvyšší čistý příjem je označený „nejvyšší čistý příjem“.

- Na počítači je to tabulka. Na telefonu jsou to karty, které se posouvají do stran.
- Scénář se počítá podle **oficiálních** hodnot svého roku. Pokud rok žádné oficiální hodnoty nemá, scénář se nepočítá. Sloupec **Aktuální výpočet** naopak používá i vlastní hodnoty (kapitola 10).

---

## 7. Cílový příjem

Obrazovka obrátí výpočet: zadáš, kolik čistého chceš měsíčně, a dostaneš hodinovou sazbu, kterou k tomu potřebuješ.

- **Chci čistého měsíčně**: výchozí je tvůj čistý příjem zaokrouhlený nahoru na tisíce.
- **Potřebná sazba** je v Kč za hodinu. Pod ní jsou fakturace za rok, čistý příjem měsíčně, hrubý ekvivalent (zaměstnanec), aktuální sazba a rozdíl.
- Ostatní nastavení (dny, hodiny, náklady, slevy) se bere z výpočtu. Přepsané hodnoty se při hledání ignorují.
- **Použít tuto sazbu** nastaví sazbu ve výpočtu. Odkaz **Otevřít výpočet** tam přejde.
- Pokud nestačí ani 20 000 Kč za hodinu, aplikace to napíše a sazbu nenabídne.

---

## 8. Dávky

Obrazovka porovnává, co dostane zaměstnanec a co OSVČ při stejném měsíčním příjmu, při nemoci, mateřské a otcovské. Zároveň ukazuje, kdo má nárok.

**Karta dobrovolného nemocenského OSVČ** ukazuje, jestli je pojištění zapnuto ve výpočtu, měsíční pojistné a vyměřovací základ. Když je vypnuto, počítá se s minimálním pojistným roku.

**Vstupy** jsou předvyplněné z výpočtu. Nic se neukládá; po odchodu z obrazovky se vrátí výchozí hodnoty.

| Vstup | Výchozí | Význam |
| --- | --- | --- |
| Hrubá měsíční mzda zaměstnance | hrubý ekvivalent z výpočtu | základ pro zaměstnance |
| Měsíční pojistné OSVČ na nemocenskou | podle výpočtu, jinak minimum | základ pro OSVČ |
| Délka nemoci | 30 dní | kalendářní dny; zaměstnavatel platí prvních 14 dní |
| Dvě nebo více dětí najednou | ne | mateřská 37 týdnů místo 28 |
| Dny pojištění za posledních 2 roky | 730 | mateřská potřebuje 270 dní |
| Dny OSVČ nemocenského za poslední rok | 365, nebo 0 bez pojištění | mateřská OSVČ potřebuje 180 dní |
| Měsíce OSVČ nemocenského před nárokem | 12, nebo 0 bez pojištění | OSVČ čeká na nemocenskou a otcovskou 3 měsíce |
| Navazuji na zaměstnání | ne | OSVČ pojištění začalo do 8 dnů po skončení zaměstnání, které bylo pojištěné posledních 3 měsíce |

**Porovnání dávek** je tabulka se dvěma sloupci, Zaměstnanec a OSVČ. Ukazuje částky v Kč za zadanou dobu:

- náhradu mzdy od zaměstnavatele za dny 1–14 (jen zaměstnanec);
- nemocenskou od 15. dne a celkem za nemoc;
- denní nemocenskou za 15.–30. den;
- denní peněžitou pomoc v mateřství, mateřskou za 28, nebo 37 týdnů;
- otcovskou za 14 dní.

OSVČ za prvních 14 dní nedostává nic. Rozbalovací **Jak počítáme** popisuje výpočet. Paragrafy a podrobnosti jsou v souboru `docs/legal-research/sickness-insurance.md` v repozitáři.

**Nárok** je tabulka ano/ne pro nemocenskou, mateřskou a otcovskou, zvlášť pro zaměstnance a OSVČ, s chybějícími podmínkami. Je orientační. O nároku rozhoduje ČSSZ.

---

## 9. Data a sdílení

Všechna data zůstávají v zařízení. Obrazovka má čtyři části.

### 9.1 Sdílet můj výpočet

- **Odkaz na tento výpočet** je odkaz, který obsahuje rok a tvoje vstupy (ty, které se liší od výchozích). Na serveru se nic neukládá.
- **Sdílet odkaz** otevře sdílecí nabídku prohlížeče. Když ji prohlížeč nemá, odkaz se zkopíruje. **Kopírovat odkaz** ho zkopíruje vždy.
- Odkaz platí pro rok, který je v něm uvedený (text „Odkaz platí pro rok …“).
- Příjemce, který otevře odkaz, uvidí tvůj výpočet za ten rok. Pokud pro daný rok nemá oficiální hodnoty, výsledky neuvidí. Vlastní hodnoty v odkazu nejsou.
- Otevření odkazu přepíše vstupy pro daný rok. Potvrdí to zpráva **Načteno ze sdíleného odkazu**. Pokud odkaz nejde načíst, aplikace napíše **Sdílený odkaz nelze načíst.**

### 9.2 Sdílet aplikaci

**Sdílet aplikaci** pošle odkaz na aplikaci. Otevře se v prohlížeči a funguje i offline.

### 9.3 Export a import

- **Exportovat data** stáhne soubor JSON se všemi daty aplikace (všechny roky, scénáře, vlastní hodnoty, nastavení). Soubor se jmenuje například `osvc-v-zamestnanec-2026-11-04.json`.
- **Importovat ze souboru**: vybereš soubor. Aplikace ho nejdřív zkontroluje. Pokud je v pořádku, zeptá se: „Import nahradí všechna tvoje data. Pokračovat?“. Teprve potom data nahradí. Soubor, který není zálohou této aplikace, nebo není platný JSON, se odmítne a nic se nezmění.

### 9.4 Nastavení

- **Synchronizovat vstupy mezi roky**: vypnuto (výchozí) znamená, že každý rok má vlastní vstupy. Zapnuto znamená, že všechny roky sdílejí jednu sadu (kapitola 10.4).
- **Jazyk**: Čeština, English.
- **Motiv**: Podle systému, Světlý, Tmavý.

### 9.5 Smazat data

**Smazat všechna data** smaže vstupy všech let, scénáře, vlastní hodnoty a nastavení v tomto zařízení. Nedá se vrátit zpět, proto si nejdřív exportuj zálohu. Aplikace se ptá, než smaže.

---

## 10. Daňové roky

### 10.1 Okno let

Aplikace zná čtyři roky: dva minulé, aktuální a příští. V roce 2026 jsou to roky 2024 až 2027. Na začátku roku nejstarší rok z okna vypadne a přidá se nový příští rok. Okno se posouvá samo; nemusíš s ním nic dělat.

Rok se volí v hlavičce. U každého roku je druh:

- **minulý rok**: oficiální hodnoty, slouží k porovnání;
- **aktuální**: hodnoty platné teď;
- **příští**: budoucí rok. Pokud jeho hodnoty už vyšly, počítá se normálně.

Patička stránky ukazuje datum, od kdy jsou hodnoty roku platné. Pro minulý rok připomene, že hodnoty jsou jen pro srovnání.

### 10.2 Rok bez hodnot

Když pro příští rok ještě oficiální hodnoty nejsou, nahoře na obrazovce je hlášení **Hodnoty pro {rok} doplníme co nejdříve.** S dvěma volbami:

- **Počkat na oficiální hodnoty**: přepne na aktuální rok.
- **Zadat vlastní hodnoty**: otevře formulář pro vlastní čísla.

Bez hodnot se výpočet, rozdělení faktury, cílový příjem a dávky místo výsledků ukážou jako „nejsou hodnoty“. Scénář pro takový rok se nespočítá.

### 10.3 Vlastní hodnoty

Formulář **Vlastní hodnoty pro {rok}** se předvyplní hodnotami posledního oficiálního roku. Změň jen to, co se liší:

- průměrná mzda (od ní se odvozují minimální základy);
- minimální mzda;
- pracovní dny v roce;
- paušální daň, pásmo 1 a 2;
- podíl průměrné mzdy pro minimální základ SP;
- sleva na poplatníka;
- daňové zvýhodnění na 1., 2. a 3. a další dítě.

Tlačítko **Uložit a použít** nastaví vlastní hodnoty pro daný rok. Od té chvíle jsou výsledky označené odznakem **vlastní hodnoty**. Vlastní hodnoty jsou jen ve tvém zařízení.

Když vyjdou oficiální hodnoty pro rok, který máš s vlastními hodnotami, aplikace se jednou zeptá: „Oficiální hodnoty pro {rok} jsou k dispozici. Přepnout na ně?“ S volbami **Ano, přepnout** a **Ne, nechat vlastní**. Odpověď se pamatuje.

Tlačítko **Upravit vlastní čísla** formulář pro daný rok znovu otevře.

### 10.4 Synchronizace vstupů mezi roky

Každý rok má vlastní vstupy, jako záznam toho roku. Když zapneš **Synchronizovat vstupy mezi roky** (Data a sdílení), všechny roky sdílejí jednu sadu vstupů. Hodí se, když chceš porovnat stejný scénář napříč roky. Vypnutí zkopíruje sdílenou sadu do všech roků.

### 10.5 Odznaky

- **vlastní hodnoty** (v hlavičce a u výsledků): výsledek se počítá z tvých vlastních čísel.
- **neověřeno** (v hlavičce a u výsledků): výsledek závisí na hodnotě, která ještě není potvrzena dvěma zdroji. Když na odznak najedeš, ukáže se, o které hodnoty jde.

O zdrojích a stavu hodnot je v **O aplikaci** (kapitola 11).

---

## 11. O aplikaci

Obrazovka popisuje, na co aplikace odpovídá, jak výpočet funguje a odkud jsou hodnoty.

**Jak výpočet funguje** (osm kroků):

1. Fakturovatelné hodiny za rok (pracovní dny, hodiny za den a sazba) dají fakturovanou částku.
2. Z ní se odečtou odvody: pojistné na sociální a zdravotní pojištění, nebo paušální daň, pokud ji zvolíš.
3. Po odečtení odvodů a nákladů zbude základ daně; z něj daň z příjmů po slevách a odpočtech.
4. Z toho, co zbude, se vyčlení rezerva a částka na dovolenou.
5. Výsledkem je čistý měsíční příjem.
6. Hrubý ekvivalent je hrubá mzda zaměstnance, jejíž čistý příjem se stejnými slevami a pravidly roku odpovídá tvému čistému příjmu.
7. Rozdělení faktury používá roční podíly, které výpočet spočítal.
8. Hodnoty pro každý rok jsou v datech aplikace; zdroje jsou uvedené níže.

**Zdroje hodnot pro rok** jsou seskupené podle hodnoty, každý s odznakem stavu:

| Odznak | Význam |
| --- | --- |
| ověřeno | údaj potvrzují dva zdroje, které se shodují |
| z textu zákona | odvozeno z textu zákona, agentura ji zatím nezveřejnila |
| vlastní | hodnotu jsi zadal(a) sám(a) |

**Soukromí**: aplikace nemá server, účty ani sledování a nepoužívá cookies. Data zůstávají v zařízení. Sdílený odkaz obsahuje jen údaje, které sám zvolíš.

**Licence**: MIT. Zdrojový kód je na GitHubu.

**Chyby a náměty** se hlásí jako issue na GitHubu: https://github.com/benabraham/osvc-v-employee/issues. Aplikace nemá oficiální podporu.

**Autor**: Dan Srb. Aplikace vychází z jeho tabulky *OSVČ v. zaměstnanec 2026* a z jeho videa na YouTube.

---

## 12. Instalace a práce offline

Aplikace je webová, ale dá se nainstalovat jako aplikace. Postup závisí na prohlížeči a jeho verzi; názvy položek se mohou lišit.

- **Android (Chrome)**: otevři aplikaci, v menu (⋮) zvol **Nainstalovat aplikaci** nebo **Přidat na plochu**.
- **iPhone a iPad (Safari)**: otevři aplikaci, klepni na tlačítko Sdílet a zvol **Přidat na plochu**.
- **Počítač (Chrome, Edge)**: v adresním řádku klikni na ikonu instalace, nebo v menu zvol instalaci aplikace.

Aplikace nemá vlastní tlačítko instalace. Po instalaci se otevírá v samostatném okně bez adresního řádku.

**Offline**: po prvním otevření se aplikace uloží do zařízení a funguje i bez připojení. Když je připravena offline, ukáže se zpráva **Aplikace je připravena offline**. Když vyjde nová verze, ukáže se **Nová verze je k dispozici** s tlačítkem **Načíst znovu**.

---

## 13. Co znamenají varování

Varování se objeví na obrazovce Výpočet pod hlavním číslem. Nikdy neblokují zadávání.

| Varování | Co znamená |
| --- | --- |
| Fakturace je nad 1,5 mil. Kč | Model tu nepočítá 3. pásmo paušální daně, vyšší sazbu daně ani DPH. Výsledek není spolehlivý. |
| Hrubá mzda odpovídající tvému příjmu je pod minimální mzdou | Čistý příjem je nízký vzhledem k minimální mzdě roku. Zvaž vyšší sazbu nebo jiné nastavení. |
| Paušální daň je zapnutá, ale fakturace je nad 2. pásmem | Paušální daň pro tvůj příjem není k dispozici. Výsledek počítá s částkou 3. pásma, kterou nelze uplatnit. |
| Nevyužitou slevu na děti nelze vyplatit jako daňový bonus | Příjmy nedosahují šestinásobku minimální mzdy, bonus proto nenáleží. |

---

## 14. Co model neumí

- **DPH.** Výpočet nepočítá s plátcem DPH. Pokud jsi plátce, výsledky nejsou správné.
- **3. pásmo paušální daně.** Aplikace ho nemá. Nad 2. pásmem varuje.
- **Fakturace nad 1,5 mil. Kč.** Mimo rozsah modelu; aplikace varuje.
- **Hrubá mzda je odhad.** Počítá se po krocích kvůli zaokrouhlování, takže čistý příjem skáče zhruba o 15 Kč. Přesná shoda někdy není možná.
- **Důchody.** Aplikace je nepočítá. Důchod OSVČ bývá nižší než důchod zaměstnance; to je jen poznámka.
- **Jiné příjmy** než z OSVČ (zaměstnání, pronájem, úroky a podobně). Aplikace pro ně nemá žádný vstup.
- **Účetnictví, fakturace a daňové přiznání.** Nejsou součástí aplikace.
- **Scénáře** používají oficiální hodnoty svého roku, ne vlastní čísla.
- **Dávky** jsou zjednodušené: měsíční hrubá mzda je základ, dny jsou kalendářní, pracovní den má 8 hodin. Nezahrnuje snížení nemocenské na polovinu (například při rvačce nebo opilosti) a nepočítá ošetřovné. Nárok je orientační.
- **Hodnoty roku 2027** jsou odvozené z textu zákona. Část z nich agentury zatím nezveřejnily; takové výsledky nesou odznak **neověřeno**.
- **Obecně**: aplikace je odhad a nenahrazuje daňového poradce.

---

# English summary

**Offline-first web app** for Czech freelancers (OSVČ). It answers two questions: what employee gross salary matches the net income of your invoicing, and how to split each invoice (levies, costs, reserve, holiday, what you can spend). It runs in the browser, works offline after the first visit and keeps all data on the device. Live at https://benabraham.github.io/osvc-v-employee/. Results are an estimate, not tax advice.

**Start:** set up the calculator first (**Výpočet**), then open **Rozdělit fakturu** and tap "Done, open the invoice split by default". After that the app opens on the splitter.

**Screens:**

- **Rozdělit fakturu** (splitter): invoice amount, quick amounts, the split into levies, costs, reserve, holiday and what you can spend. Copy button.
- **Výpočet** (calculator): net per month, equivalent gross, paušální daň hint, warnings, detailed results. Inputs: invoicing, state and levies (expense rate 30/40/60/80 %, new OSVČ, voluntary sickness insurance), credits and deductions (collapsed), reserve. Two values can be overridden (tax-deductible costs, total levies), marked "upraveno", with "Vrátit výpočet" to reset.
- **Náklady** (costs): name, price, months of amortisation; yearly cost = price × 12 ÷ months.
- **Scénáře** (scenarios): save the calculation under a name, load, rename, delete, compare side by side. Scenarios use the official values of their year.
- **Cílový příjem** (target income): net per month → hourly rate needed; "Use this rate" applies it.
- **Dávky** (benefits): sickness, maternity and paternity benefit for an employee and an OSVČ, with eligibility. Inputs are not saved.
- **Data a sdílení** (data and sharing): share a link to the calculation (year and inputs only), share the app, export and import a JSON backup, sync inputs across years, language, theme, delete all data.
- **O aplikaci** (about): how the calculation works, privacy, disclaimer, sources of each year's values with their status.

**Tax years:** the header shows four years: two past, the current one and the next. A year without official values shows a notice; you can wait or enter your own figures. "vlastní hodnoty" means results use your own numbers; "neověřeno" means a value is not yet confirmed by two agreeing sources (it may come from the law alone).

**Installing and offline:** Android Chrome (menu, "Install app" or "Add to home screen"), iPhone Safari (Share, "Add to Home Screen"), desktop Chrome or Edge (install icon in the address bar). After the first visit it works offline.

**Limits:** no VAT, no third paušální daň band, out of scope above CZK 1.5 million invoiced, the gross salary is an approximation, no pensions or other income, benefits are simplified and eligibility is indicative.

**Reporting problems:** GitHub issues, https://github.com/benabraham/osvc-v-employee/issues.
