import { useState } from 'preact/hooks'
import { store, useT } from '../../app/context'
import { readTextFile, downloadTextFile } from '../../state/files'
import { exportFileNameFor, importProblemFor, type ImportProblem } from './data-files'

/** Where an import is: nothing chosen, waiting for the confirmation, refused, or done. */
type ImportStep =
  | { kind: 'idle' }
  | { kind: 'confirm'; text: string }
  | { kind: 'refused'; problem: ImportProblem }
  | { kind: 'imported' }

const problemKeys: Record<ImportProblem, string> = {
  invalidJson: 'data.backup.error.invalidJson',
  invalidFormat: 'data.backup.error.invalidFormat',
}

/**
 * Export the whole state as a JSON file, and import such a file. An import replaces all data, so it needs a second
 * step: the file is checked first, and only a valid one asks for confirmation (PRD user story 10).
 */
export const BackupSection = () => {
  const t = useT()
  const [step, setStep] = useState<ImportStep>({ kind: 'idle' })
  const [isExported, setIsExported] = useState(false)

  const exportData = () => {
    downloadTextFile({ filename: exportFileNameFor({ today: new Date() }), text: store.exportState(), document })
    setIsExported(true)
  }

  const chooseFile = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    const text = await readTextFile(file)
    // cleared, so choosing the same file again after a refusal fires a change event
    input.value = ''
    const problem = importProblemFor({ text })
    setStep(problem ? { kind: 'refused', problem } : { kind: 'confirm', text })
  }

  const confirmImport = (text: string) => {
    const result = store.importState(text)
    setStep(result.ok ? { kind: 'imported' } : { kind: 'refused', problem: result.error })
  }

  return (
    <section class="card stack" aria-labelledby="data-backup-heading">
      <h2 id="data-backup-heading">{t('data.backup.heading')}</h2>
      <p class="muted">{t('data.backup.explain')}</p>
      <div class="row">
        <button type="button" class="button secondary" onClick={exportData}>
          {t('data.backup.export')}
        </button>
      </div>
      <p role="status" class="small muted">{isExported ? t('data.backup.exported') : ''}</p>

      <h3>{t('data.backup.import')}</h3>
      <div class="field">
        <label for="data-backup-file">{t('data.backup.fileLabel')}</label>
        <input id="data-backup-file" type="file" accept="application/json" onChange={chooseFile} />
      </div>

      {step.kind === 'confirm' ? (
        <div class="notice warning" role="group" aria-label={t('data.backup.confirm')}>
          <p>{t('data.backup.confirm')}</p>
          <div class="row">
            <button type="button" class="button" onClick={() => confirmImport(step.text)}>
              {t('data.backup.continue')}
            </button>
            <button type="button" class="button secondary" onClick={() => setStep({ kind: 'idle' })}>
              {t('action.cancel')}
            </button>
          </div>
        </div>
      ) : null}
      {step.kind === 'refused' ? (
        <p role="alert" class="field-error">
          {t(problemKeys[step.problem])}
        </p>
      ) : null}
      {step.kind === 'imported' ? <p role="status">{t('data.backup.imported')}</p> : null}
    </section>
  )
}
