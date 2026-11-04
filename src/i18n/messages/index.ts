import type { MessageBundle } from '../types'
import { commonMessages } from './common'

/**
 * Every message bundle the app uses. One file per feature in this folder; add the export here.
 * `bundles.test.ts` checks each bundle: same keys in cs and en, same placeholders, dotted keys.
 */
export const allBundles: readonly MessageBundle[] = [commonMessages]
