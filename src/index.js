import "./auto-type/onExit"
import { lc } from "./layerCompose"
import lens from "./external/patterns/lens"
import { parent } from "./external/patterns/parent"
import { findDependency } from "./external/patterns/findDependency"
import { deepJSON } from "./utils/deepJSON"

lc.parent = parent
lc.lens = lens
lc.dependency = findDependency


export {IS_DEV_MODE} from "./const"

export layerCompose from './layerCompose'
export {$, o, lc} from './layerCompose'

export assign       from "./external/patterns/assign"
export defaults       from "./external/patterns/defaults"
export generate       from "./external/patterns/generate"
export coreLens       from "./external/patterns/coreLens"
export memo       from "./external/patterns/memo"
export transform       from "./external/patterns/transform"
export attach     from "./external/patterns/attach"
export replace     from "./external/patterns/replace"
export { defer }     from "./external/patterns/defer"
export pause     from "./external/patterns/pause"
export { select } from './external/patterns/select'
export { orNull } from './external/patterns/orNull'
export { copy } from './external/patterns/copy'
export { composeFunctions as compose } from './external/patterns/composeFunctions'
export const serialize = (_,opt = {accessors: ['_Serialized', '_JSON']}) => deepJSON(_,opt)

export {findDependency}

export core     from "./external/patterns/core"

export {lens, parent}

export {unbox} from "./utils"
// export {unbox, getComposition, getLayerId, renameIntoGetter} from "./utils"
export {unwrapProxy} from './proxies/utils'

export {enableDebug} from './utils/enableDebug'
export {getCompositionFromInstance} from './compose/markWithId'
