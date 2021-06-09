import {IS_DEV_MODE} from "./const"

import cleanData        from './external/utils/cleanData'
import transformGetters from "./external/utils/transformGetters"
import Async            from "./external/compositions/Async"
import {getComposition} from "./utils"
import withTransform    from "./external/patterns/withTransform"
import transform    from "./external/patterns/transform"

import layerCompose from './layerCompose'

export default layerCompose


export {unbox, getComposition} from "./utils"
export {
    layerCompose,

    IS_DEV_MODE,

    cleanData,
    transformGetters,

    Async,

    transform,
    withTransform
}
