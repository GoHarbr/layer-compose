import {createConstructor}                            from "./constructor/createConstructor"
import {compose}                                                       from "./compose"
import {$composition, $runOnInitialize, $spec, IS_DEV_MODE, LC_SYMBOL} from "./const"
import {isService}                                                     from "./utils"

const withServices = spec => additionalServices => {
    if (Object.values(additionalServices).some(s => !isService(s))) throw new Error("Services must be instantiated")
    return layerCompose(...spec, additionalServices)  // fixme remove additionalServices if empty
}
layerCompose.withServices = withServices

/*
* todo:
*  add ability to replace services. could be useful for testing, or could be a bad idea.
* */

export default function layerCompose(...layers) {
    let composed = {[$runOnInitialize]: []}

    compose(layers, composed)

    const constructor = createConstructor(composed)
    constructor.lcId = LC_SYMBOL // fixme give symbol accessor
    constructor[$spec] = layers
    constructor[$composition] = composed
    constructor.withServices = withServices(layers)
    constructor.partial = (presetValues) => (data = {}) => constructor({...data, ...presetValues}) // fixme this looses properties set on contructor

    return constructor
}

export {getDataFromPointer as unbox} from './utils'
export cleanData from './external-utils/cleanData'
export {
    IS_DEV_MODE,
}
