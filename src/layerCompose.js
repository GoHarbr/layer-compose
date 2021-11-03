import {
    $dataPointer,
    $extendSuper,
    $layerOrder,
    $layers,
    $parentInstance,
    $runOnInitialize,
    $writableKeys,
    IS_DEV_MODE
} from "./const"
import compose                                                                                          from "./compose/compose"
import seal                                                                              from "./constructor/seal"
import {createConstructor}                                                               from "./constructor/createConstructor"

export default function layerCompose(...layers) {
    if (layers.some(_ => !_)) {
        throw new Error("A layer cannot be nothing")
    }

    try {
        let composed = {
            [$layers]: new Map(),
            [$layerOrder]: [],
            [$runOnInitialize]: [],
            [$extendSuper]: undefined,
            [$dataPointer]: undefined,
            [$writableKeys]: [$parentInstance],
            toJSON: ($, _, opt) => {
                return _
            }
        }

        composed = compose(layers, composed)
        composed = seal(composed)

        const constructor = createConstructor(composed)

        return constructor
    } catch (e) {
        console.error("layerCompose encountered an error while compiling a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}
