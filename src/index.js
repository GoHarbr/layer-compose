import {createConstructor} from "./createConstructor"
import {compose}           from "./compose"
import {lcSymbol}          from "./const"

export default function layerCompose(...layers) {
    const executeOnInitialize = []
    let composed = {}

    for (const layer of layers) {
        compose(layer, composed)
    }

    const constructor = createConstructor(composed)
    constructor.lcId = lcSymbol
    constructor.spec = layers
    // constructor.curry = (_) => () => constructor(_) // todo. explore a more performant approach

    return constructor
}

/* services are composed into the methods and accessed through super */

