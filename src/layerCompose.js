import {$dataPointer, $extendSuper, $runOnInitialize, $spec, $writableKeys, IS_DEV_MODE} from "./const"
import compose                                                                           from "./compose/compose"
import seal                                                                              from "./constructor/seal"
import {createConstructor}                                                               from "./constructor/createConstructor"

export default function layerCompose(...layers) {
    try {
        let composed = {
            [$runOnInitialize]: [],
            [$extendSuper]: undefined,
            [$dataPointer]: undefined,
            [$writableKeys]: [],
            toJSON: ($, _, opt) => {
                return _
            }
        }

        composed = compose(layers, composed)
        composed = seal(composed)

        const constructor = createConstructor(composed)

        // constructor[$isLc] = true
        constructor[$spec] = layers
        // constructor[$composition] = composed

        return constructor
    } catch (e) {
        if (IS_DEV_MODE) throw e
        console.error(e)
    }
}
