import {IS_DEV_MODE} from "./const"

export layerCompose from './layerCompose'

export assign       from "./external/patterns/assign"
export defaults       from "./external/patterns/defaults"
export generate       from "./external/patterns/generate"
export coreLens       from "./external/patterns/coreLens"
export lens     from "./external/patterns/lens"
export memo       from "./external/patterns/memo"
export transform       from "./external/patterns/transform"
export attach     from "./external/patterns/attach"
export replace     from "./external/patterns/replace"

export parent     from "./external/patterns/parent"
export core     from "./external/patterns/core"

export {unbox, getComposition, getLayerId, renameIntoGetter} from "./utils"
export {unwrapProxy} from './proxies/utils'

export {enableDebug} from './external/utils/enableDebug'
