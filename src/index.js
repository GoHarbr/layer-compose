import {createConstructor}                                         from "./constructor/createConstructor"
import compose                                                                                     from "./compose/compose"
import {$$, $composition, $dataPointer, $extendSuper, $isLc, $runOnInitialize, $spec, IS_DEV_MODE} from "./const"

import cleanData               from './external-utils/cleanData'
import transformGetters        from "./external-utils/transformGetters"
import seal                    from "./constructor/seal"
/*
* todo:
*  add ability to replace services. could be useful for testing, or could be a bad idea.
* */

export default function layerCompose(...layers) {
    try {
        let composed = {
            [$runOnInitialize]: [],
            [$extendSuper]: undefined,
            [$dataPointer]: undefined,
            // then: transformToStandardArgs(($, opt) => opt.onFulfilled($[$$])),
            toJSON: ($, _, opt) => {
                return _
            }
        }

        composed = compose(layers, composed)
        composed = seal(composed)

        const constructor = createConstructor(composed)

        constructor[$isLc] = true
        constructor[$spec] = layers
        constructor[$composition] = composed


        return constructor
    } catch (e) {
        // if (IS_DEV_MODE) throw e
        console.warn(e)
    }
}

/*
 * Utils
 * */
export {unbox} from "./utils"
export {
    IS_DEV_MODE,

    cleanData,
    transformGetters
}
