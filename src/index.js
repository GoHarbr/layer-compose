import {createConstructor}                            from "./constructor/createConstructor"
import {compose}                                      from "./compose"
import {$onInitialize, $spec, IS_DEV_MODE, LC_SYMBOL} from "./const"
import {isService}                                    from "./utils"


const withServices = spec => additionalServices => {
    if (Object.values(additionalServices).some(s => !isService(s))) throw new Error("Services must be instantiated")
    return layerCompose(...spec, additionalServices)  // fixme remove additionalServices if empty
}
layerCompose.withServices = withServices

export default function layerCompose(...layers) {
    let composed = {[$onInitialize]: []}

    compose(layers, composed)

    const constructor = createConstructor(composed)
    constructor.lcId = LC_SYMBOL // fixme give symbol accessor
    constructor[$spec] = layers
    constructor.withServices = withServices(layers)

    return constructor
}

export {
    IS_DEV_MODE
}
