import {IS_DEV_MODE} from "./const"

import cleanData        from './external/utils/cleanData'
import transformGetters from "./external/utils/transformGetters"

import Async            from "./external/compositions/Async"
import Observable            from "./external/compositions/Observable"
import withJson            from "./external/compositions/withJson"

import {getComposition, renameIntoGetter} from "./utils"
import withTransform    from "./external/patterns/withTransform"
import transform    from "./external/patterns/transform"
import defaults    from "./external/patterns/defaults"
import detachSelf    from "./external/patterns/detachSelf"

import layerCompose from './layerCompose'

export default layerCompose


export {unbox, getComposition, getLayerId, renameIntoGetter} from "./utils"
export {unwrapProxy} from './proxies/utils'
export {
    layerCompose,

    IS_DEV_MODE,

    cleanData,
    transformGetters,

    Async,
    Observable,
    withJson,

    transform,
    defaults,
    withTransform,
    detachSelf
}
