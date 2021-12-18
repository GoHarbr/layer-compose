import {
    $dataPointer,
    $extendSuper, $importsComplete,
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

        return createConstructor(layers)

    } catch (e) {
        console.error("layerCompose encountered an error while creating a constructor for a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}
