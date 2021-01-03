import {createConstructor}                            from "./createConstructor"
import {compose}                                      from "./compose"
import {$spec, $onInitialize, LC_SYMBOL, IS_DEV_MODE} from "./const"

export default function layerCompose(...layers) {
    let composed = {[$onInitialize]: []}

    compose(layers, composed)

    const constructor = createConstructor(composed)
    constructor.lcId = LC_SYMBOL
    constructor[$spec] = layers

    return constructor
}

export {
    IS_DEV_MODE
}
