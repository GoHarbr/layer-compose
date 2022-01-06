import {$at, $isLc, IS_DEV_MODE} from "./const"
import {createConstructor}       from "./constructor/createConstructor"

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


export function $ (layer, baseLayer, {unsafe = true} = {}) {
    if (!layer?.[$isLc] && typeof layer != 'object' || Array.isArray(layer) || layer == null) {
        throw new Error('A layer must be an object')
    }
    if (unsafe) {
        console.warn('Unsafe use of $ to compose. Used tethered form (prevents bugs) : `o.$().$() ... `')
    }

    const c = baseLayer ? layerCompose(layer, baseLayer) : layerCompose(layer)

    c.$ = layer => $(c, layer)

    return c
}

export const o = {
    $(layer) {
        return $(layer, {unsafe: false})
    }
}
