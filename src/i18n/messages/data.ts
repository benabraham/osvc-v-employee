import type { MessageBundle } from '../types'

/** Strings of the "data" feature. Keys start with 'data.'; every key exists in cs and en. */
export const dataMessages: MessageBundle = {
  cs: {
    'data.title': 'Data a sdílení',
    'data.intro': 'Všechna data zůstávají v tomto zařízení. Sdílet můžeš výpočet jako odkaz, nebo celou aplikaci.',

    'data.share.heading': 'Sdílet můj výpočet',
    'data.share.explain': 'Odkaz obsahuje jen tvoje vstupy; nic se neukládá na server.',
    'data.share.button': 'Sdílet odkaz',
    'data.share.linkLabel': 'Odkaz na tento výpočet',
    'data.share.copy': 'Kopírovat odkaz',
    'data.share.yearNote': 'Odkaz platí pro rok {year}.',

    'data.app.heading': 'Sdílet aplikaci',
    'data.app.explain': 'Pošli odkaz na aplikaci. Otevře se v prohlížeči a funguje i offline.',
    'data.app.button': 'Sdílet aplikaci',
    'data.app.text': 'Porovnej příjem OSVČ se mzdou zaměstnance.',

    'data.result.shared': 'Sdíleno.',
    'data.result.copied': 'Odkaz je zkopírovaný do schránky.',
    'data.result.failed': 'Sdílení se nepodařilo nebo bylo zrušeno.',
    'data.result.copyFailed': 'Kopírování se nepodařilo. Odkaz můžeš označit a zkopírovat ručně.',

    'data.backup.heading': 'Export a import',
    'data.backup.explain': 'Záloha je soubor JSON se všemi daty aplikace. Hodí se pro přenos do jiného zařízení.',
    'data.backup.export': 'Exportovat data',
    'data.backup.exported': 'Záloha se stahuje.',
    'data.backup.import': 'Importovat ze souboru',
    'data.backup.fileLabel': 'Soubor se zálohou',
    'data.backup.confirm': 'Import nahradí všechna tvoje data. Pokračovat?',
    'data.backup.continue': 'Pokračovat',
    'data.backup.imported': 'Data byla naimportována.',
    'data.backup.error.invalidJson': 'Soubor není platný JSON. Nic se nezměnilo.',
    'data.backup.error.invalidFormat': 'Soubor není zálohou této aplikace. Nic se nezměnilo.',

    'data.settings.heading': 'Nastavení',
    'data.settings.syncLabel': 'Synchronizovat vstupy mezi roky',
    'data.settings.syncHelp': 'Vypnuto: každý rok má vlastní vstupy. Zapnuto: všechny roky sdílejí jednu sadu.',

    'data.reset.heading': 'Smazat data',
    'data.reset.explain':
      'Smaže vstupy všech let, scénáře, vlastní hodnoty a nastavení v tomto zařízení. Nedá se vrátit zpět, proto si nejdřív exportuj zálohu.',
    'data.reset.button': 'Smazat všechna data',
    'data.reset.confirm': 'Opravdu smazat všechna data? Tuto akci nelze vrátit.',
    'data.reset.done': 'Všechna data jsou smazaná.',
  },
  en: {
    'data.title': 'Data and sharing',
    'data.intro': 'All data stays on this device. You can share a calculation as a link, or the whole app.',

    'data.share.heading': 'Share my calculation',
    'data.share.explain': 'The link contains only your inputs; nothing is stored on a server.',
    'data.share.button': 'Share link',
    'data.share.linkLabel': 'Link to this calculation',
    'data.share.copy': 'Copy link',
    'data.share.yearNote': 'The link is for {year}.',

    'data.app.heading': 'Share the app',
    'data.app.explain': 'Send the app link. It opens in a browser and works offline too.',
    'data.app.button': 'Share the app',
    'data.app.text': 'Compare freelance income with an employee salary.',

    'data.result.shared': 'Shared.',
    'data.result.copied': 'The link is copied to the clipboard.',
    'data.result.failed': 'Sharing failed or was cancelled.',
    'data.result.copyFailed': 'Copying failed. You can select the link and copy it by hand.',

    'data.backup.heading': 'Export and import',
    'data.backup.explain': 'The backup is a JSON file with all the app data. Use it to move to another device.',
    'data.backup.export': 'Export data',
    'data.backup.exported': 'The backup is downloading.',
    'data.backup.import': 'Import from a file',
    'data.backup.fileLabel': 'Backup file',
    'data.backup.confirm': 'Importing replaces all your data. Continue?',
    'data.backup.continue': 'Continue',
    'data.backup.imported': 'The data has been imported.',
    'data.backup.error.invalidJson': 'The file is not valid JSON. Nothing was changed.',
    'data.backup.error.invalidFormat': 'The file is not a backup of this app. Nothing was changed.',

    'data.settings.heading': 'Settings',
    'data.settings.syncLabel': 'Sync inputs across years',
    'data.settings.syncHelp': 'Off: each year keeps its own inputs. On: all years share one set.',

    'data.reset.heading': 'Delete data',
    'data.reset.explain':
      'Deletes the inputs of all years, scenarios, own values and settings on this device. It cannot be undone, so export a backup first.',
    'data.reset.button': 'Delete all data',
    'data.reset.confirm': 'Really delete all data? This cannot be undone.',
    'data.reset.done': 'All data has been deleted.',
  },
}
