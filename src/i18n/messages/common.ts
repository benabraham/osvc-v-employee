import type { MessageBundle } from '../types'

/**
 * App-wide strings: names, navigation, year kinds, badges, units, actions.
 * Keys are dotted; every key exists in both `cs` (primary) and `en`.
 */
export const commonMessages: MessageBundle = {
  cs: {
    'app.name': 'OSVČ vs. zaměstnanec',

    'nav.main': 'Hlavní navigace',
    'nav.split': 'Rozdělit fakturu',
    'nav.calc': 'Výpočet',
    'nav.costs': 'Náklady',
    'nav.scenarios': 'Scénáře',
    'nav.reverse': 'Cílový příjem',
    'nav.benefits': 'Dávky',
    'nav.data': 'Data a sdílení',
    'nav.about': 'O aplikaci',
    'nav.more': 'Více',

    'year.kind.historical': 'minulý rok',
    'year.kind.current': 'aktuální',
    'year.kind.next': 'příští',
    'year.next.noData': 'Hodnoty pro {year} doplníme co nejdříve',
    'year.next.choice.wait': 'Počkat na oficiální hodnoty',
    'year.next.choice.custom': 'Zadat vlastní hodnoty',
    'year.validFrom': 'Platné od {date}',

    'badge.custom': 'vlastní hodnoty',
    'badge.unverified': 'neověřeno',

    'disclaimer.text': 'Odhad, ne daňové poradenství. Výsledky jsou orientační a nenahrazují konzultaci s daňovým poradcem.',

    'feedback.report': 'Nahlásit chybu',

    'update.available': 'Nová verze je k dispozici',
    'update.reload': 'Načíst znovu',
    'offline.ready': 'Aplikace je připravena offline',

    'language.label': 'Jazyk',
    'language.cs': 'Čeština',
    'language.en': 'English',

    'theme.label': 'Motiv',
    'theme.system': 'Podle systému',
    'theme.light': 'Světlý',
    'theme.dark': 'Tmavý',

    'unit.czk': 'Kč',
    'unit.czkPerHour': 'Kč/h',
    'unit.days': 'dnů',
    'unit.hours': 'h',
    'unit.months': 'měsíců',

    'common.approximate': '≈',

    'action.save': 'Uložit',
    'action.cancel': 'Zrušit',
    'action.delete': 'Smazat',
    'action.reset': 'Obnovit',
    'action.close': 'Zavřít',
    'action.add': 'Přidat',
    'action.share': 'Sdílet',
    'action.copy': 'Kopírovat',
    'action.export': 'Exportovat',
    'action.import': 'Importovat',
  },
  en: {
    'app.name': 'Freelancer vs. employee',

    'nav.main': 'Main navigation',
    'nav.split': 'Split an invoice',
    'nav.calc': 'Calculation',
    'nav.costs': 'Costs',
    'nav.scenarios': 'Scenarios',
    'nav.reverse': 'Target income',
    'nav.benefits': 'Benefits',
    'nav.data': 'Data and sharing',
    'nav.about': 'About',
    'nav.more': 'More',

    'year.kind.historical': 'past year',
    'year.kind.current': 'current',
    'year.kind.next': 'next',
    'year.next.noData': 'Values for {year} will be added as soon as possible',
    'year.next.choice.wait': 'Wait for the official values',
    'year.next.choice.custom': 'Enter my own values',
    'year.validFrom': 'Valid from {date}',

    'badge.custom': 'own values',
    'badge.unverified': 'unverified',

    'disclaimer.text': 'An estimate, not tax advice. The results are indicative and do not replace advice from a tax adviser.',

    'feedback.report': 'Report a bug',

    'update.available': 'A new version is available',
    'update.reload': 'Reload',
    'offline.ready': 'The app is ready to work offline',

    'language.label': 'Language',
    'language.cs': 'Čeština',
    'language.en': 'English',

    'theme.label': 'Theme',
    'theme.system': 'System',
    'theme.light': 'Light',
    'theme.dark': 'Dark',

    'unit.czk': 'CZK',
    'unit.czkPerHour': 'CZK/h',
    'unit.days': 'days',
    'unit.hours': 'h',
    'unit.months': 'months',

    'common.approximate': '≈',

    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.delete': 'Delete',
    'action.reset': 'Reset',
    'action.close': 'Close',
    'action.add': 'Add',
    'action.share': 'Share',
    'action.copy': 'Copy',
    'action.export': 'Export',
    'action.import': 'Import',
  },
}
