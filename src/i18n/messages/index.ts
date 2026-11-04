import type { MessageBundle } from '../types'
import { aboutMessages } from './about'
import { benefitsMessages } from './benefits'
import { calcMessages } from './calc'
import { commonMessages } from './common'
import { costsMessages } from './costs'
import { dataMessages } from './data'
import { reverseMessages } from './reverse'
import { scenariosMessages } from './scenarios'
import { shellMessages } from './shell'
import { splitMessages } from './split'

/**
 * Every message bundle the app uses. One file per feature in this folder; add the export here.
 * `bundles.test.ts` checks each bundle: same keys in cs and en, same placeholders, dotted keys.
 */
export const allBundles: readonly MessageBundle[] = [
  commonMessages,
  shellMessages,
  calcMessages,
  splitMessages,
  costsMessages,
  scenariosMessages,
  reverseMessages,
  benefitsMessages,
  dataMessages,
  aboutMessages,
]
