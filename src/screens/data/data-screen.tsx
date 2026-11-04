import { useT } from '../../app/context'
import { BackupSection } from './backup-section'
import { ResetSection } from './reset-section'
import { SettingsSection } from './settings-section'
import { SharingSection } from './sharing-section'
import './data-screen.css'
import { registerBundle } from '../../app/context'
import { dataMessages } from '../../i18n/messages/data'

registerBundle(dataMessages)

/**
 * The data and sharing screen (#/data): share a calculation or the app, export and import the data, the settings,
 * and deleting everything. Nothing here sends data to a server.
 */
export const DataScreen = () => {
  const t = useT()
  return (
    <section class="stack data-screen" aria-labelledby="data-title">
      <h1 id="data-title">{t('data.title')}</h1>
      <p class="muted">{t('data.intro')}</p>
      <SharingSection />
      <BackupSection />
      <SettingsSection />
      <ResetSection />
    </section>
  )
}
