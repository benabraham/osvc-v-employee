import type { MessageBundle } from '../types'

/** Strings of the app shell: header controls, year notices, custom year form, toasts, footer. Keys start with 'shell.'. */
export const shellMessages: MessageBundle = {
  cs: {
    'shell.skip': 'Přejít na obsah',
    'shell.opensNewTab': '(otevře se v nové záložce)',

    'shell.year.label': 'Daňový rok',
    'shell.year.unverifiedTitle': 'Neověřené hodnoty: {values}',
    'shell.year.missing': 'Hodnoty pro {year} doplníme co nejdříve.',
    'shell.year.customInUse': 'Počítáte s vlastními hodnotami pro {year}. Oficiální hodnoty doplníme co nejdříve.',
    'shell.year.officialAvailable': 'Oficiální hodnoty pro {year} jsou k dispozici. Přepnout na ně?',
    'shell.year.wait': 'Počkám',
    'shell.year.enterOwn': 'Zadat vlastní čísla',
    'shell.year.editOwn': 'Upravit vlastní čísla',
    'shell.year.switchYes': 'Ano, přepnout',
    'shell.year.switchNo': 'Ne, nechat vlastní',

    'shell.custom.title': 'Vlastní hodnoty pro {year}',
    'shell.custom.intro':
      'Formulář je předvyplněn hodnotami posledního oficiálního roku. Upravte jen to, co se liší. Výsledky spočítané z vlastních hodnot jsou označeny „vlastní hodnoty“.',
    'shell.custom.averageWage': 'Průměrná mzda',
    'shell.custom.averageWageHelp': 'Od ní se odvozují minimální vyměřovací základy.',
    'shell.custom.minimumWage': 'Minimální mzda (měsíčně)',
    'shell.custom.workingDays': 'Pracovních dnů v roce',
    'shell.custom.pausalniBand1': 'Paušální daň, pásmo 1 (měsíčně)',
    'shell.custom.pausalniBand2': 'Paušální daň, pásmo 2 (měsíčně)',
    'shell.custom.socialMinimumShare': 'Podíl průměrné mzdy pro minimální základ SP',
    'shell.custom.payerCredit': 'Sleva na poplatníka (ročně)',
    'shell.custom.childFirst': 'Daňové zvýhodnění na 1. dítě (měsíčně)',
    'shell.custom.childSecond': 'Daňové zvýhodnění na 2. dítě (měsíčně)',
    'shell.custom.childThirdAndMore': 'Daňové zvýhodnění na 3. a další dítě (měsíčně)',
    'shell.custom.save': 'Uložit a použít',
    'shell.custom.useOfficial': 'Použít oficiální hodnoty',

    'shell.unit.czkPerMonth': 'Kč/měs.',
    'shell.unit.czkPerYear': 'Kč/rok',

    'shell.share.loaded': 'Načteno ze sdíleného odkazu',
    'shell.share.invalid': 'Sdílený odkaz nelze načíst.',

    'shell.footer.validFrom': 'Hodnoty platné od {date}',
    'shell.footer.missingCurrent': 'Pro aktuální rok {year} zatím nejsou hodnoty, výsledky proto nejsou k dispozici.',
    'shell.footer.historical': 'Hodnoty pro {year} jsou z minulého roku a slouží k porovnání.',
    'shell.footer.sheets': 'Tabulky, ze kterých výpočet vychází',
    'shell.footer.sheet': 'Tabulka {year}',
    'shell.footer.source': 'Zdrojový kód na GitHubu',
  },
  en: {
    'shell.skip': 'Skip to content',
    'shell.opensNewTab': '(opens in a new tab)',

    'shell.year.label': 'Tax year',
    'shell.year.unverifiedTitle': 'Unverified values: {values}',
    'shell.year.missing': 'Values for {year} will be added as soon as possible.',
    'shell.year.customInUse': 'You are calculating {year} with your own values. The official values will be added as soon as possible.',
    'shell.year.officialAvailable': 'The official values for {year} are available. Switch to them?',
    'shell.year.wait': 'I will wait',
    'shell.year.enterOwn': 'Enter my own figures',
    'shell.year.editOwn': 'Edit my own figures',
    'shell.year.switchYes': 'Yes, switch',
    'shell.year.switchNo': 'No, keep my own',

    'shell.custom.title': 'My own values for {year}',
    'shell.custom.intro':
      'The form is prefilled with the values of the latest official year. Change only what differs. Results calculated from your own values are marked “own values”.',
    'shell.custom.averageWage': 'Average wage',
    'shell.custom.averageWageHelp': 'The minimum assessment bases are derived from it.',
    'shell.custom.minimumWage': 'Minimum wage (monthly)',
    'shell.custom.workingDays': 'Working days in the year',
    'shell.custom.pausalniBand1': 'Flat-rate tax, band 1 (monthly)',
    'shell.custom.pausalniBand2': 'Flat-rate tax, band 2 (monthly)',
    'shell.custom.socialMinimumShare': 'Share of the average wage for the minimum social base',
    'shell.custom.payerCredit': 'Taxpayer credit (yearly)',
    'shell.custom.childFirst': 'Child credit for the 1st child (monthly)',
    'shell.custom.childSecond': 'Child credit for the 2nd child (monthly)',
    'shell.custom.childThirdAndMore': 'Child credit for the 3rd and further children (monthly)',
    'shell.custom.save': 'Save and use',
    'shell.custom.useOfficial': 'Use the official values',

    'shell.unit.czkPerMonth': 'CZK/month',
    'shell.unit.czkPerYear': 'CZK/year',

    'shell.share.loaded': 'Loaded from the shared link',
    'shell.share.invalid': 'The shared link cannot be read.',

    'shell.footer.validFrom': 'Values valid from {date}',
    'shell.footer.missingCurrent': 'There are no values for the current year {year} yet, so there are no results.',
    'shell.footer.historical': 'The values for {year} are from a past year and are for comparison only.',
    'shell.footer.sheets': 'The spreadsheets this calculation is based on',
    'shell.footer.sheet': 'Sheet {year}',
    'shell.footer.source': 'Source code on GitHub',
  },
}
