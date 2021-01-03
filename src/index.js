import {createConstructor} from "./createConstructor"
import {compose}                         from "./compose"
import {$spec, $onInitialize, LC_SYMBOL} from "./const"

export default function layerCompose(...layers) {
    let composed = {[$onInitialize]: []}

    // for (const layer of layers) {
        compose(layers, composed)
    // }

    const constructor = createConstructor(composed)
    constructor.lcId = LC_SYMBOL
    constructor[$spec] = layers

    return constructor
}

/* services are composed into the methods and accessed through super */

