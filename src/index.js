import {createConstructor} from "./createConstructor"
import {compose}                  from "./compose"
import {$onInitialize, LC_SYMBOL} from "./const"

export default function layerCompose(...layers) {
    let composed = {[$onInitialize]: []}

    for (const layer of layers) {
        compose(layer, composed)
    }

    const constructor = createConstructor(composed)
    constructor.lcId = LC_SYMBOL
    constructor.spec = layers
    // constructor.curry = (_) => () => constructor(_) // todo. explore a more performant approach

    return constructor
}

/* services are composed into the methods and accessed through super */

