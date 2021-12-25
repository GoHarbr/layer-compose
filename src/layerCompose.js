import {$at, IS_DEV_MODE}  from "./const"
import {createConstructor} from "./constructor/createConstructor"

export default function layerCompose(...layers) {
    if (layers.some(_ => !_)) {
        throw new Error("A layer cannot be nothing")
    }

    try {

        if (!layers[$at]) {
            layers[$at] = new Error()
        }

        return createConstructor(layers)

    } catch (e) {
        console.error("layerCompose encountered an error while creating a constructor for a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}


export function $ (layer) {
    if (typeof layer != 'object' || Array.isArray(layer) || layer == null) {
        throw new Error('A layer must be an object')
    }

    const c = layerCompose(layer)

    c.$ = layer => layerCompose(layer, c)
    return c
}
