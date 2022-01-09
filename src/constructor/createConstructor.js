import {
    $getComposition,
    $composition,
    $dataPointer,
    $fullyQualifiedName,
    $isCompositionInstance,
    $isLc,
    $layers,
    $lensName,
    IS_DEV_MODE
} from "../const"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods from "./wrapStandardMethods"
import constructCoreObject from "./constructCoreObject"
import compose from "../compose/compose"
import seal from "./seal"
import initialize from "./initialize"
import {queueForExecution} from "../compose/queueForExecution"

export function createConstructor(layers) {

    const _c = _constructor(layers)
    _c[$getComposition] = () => {
        return constructor[$composition] || (constructor[$composition] = compose(layers, null))
    }

    const constructor = _c.bind(_c)

    constructor[$isLc] = true
    constructor[$layers] = layers

    return constructor
}

export async function constructFromComposition(composition, coreObject, {
    lensName,
    fullyQualifiedName,
    preinitializer
}) {
    const compositionInstance = seal(composition, Object.create(null))
    compositionInstance[$isCompositionInstance] = true

    // compositionInstance[$composition] = composition
    compositionInstance[$lensName] = lensName
    compositionInstance[$fullyQualifiedName] = fullyQualifiedName
    compositionInstance[$dataPointer] = await constructCoreObject(coreObject, composition)

    preinitializer && queueForExecution(compositionInstance, () => preinitializer(compositionInstance))
    wrapStandardMethods(compositionInstance) // for methods like .then
    initialize(compositionInstance) // no need to wrap in queueForExecution

    if (IS_DEV_MODE) {
        return [wrapCompositionWithProxy(compositionInstance)]
    } else {
        return [compositionInstance]
    }
}

const _constructor = (layers) => async function (coreObject, cb, {
    lensName,
    fullyQualifiedName,
    preinitializer
} = {}) {
    try {
        const [$] = await constructFromComposition(
            await this[$getComposition](),
            coreObject,
            { lensName, fullyQualifiedName, preinitializer })

        queueForExecution($, () => {
            cb($)
        })

    } catch (e) {
        console.error("layerCompose encountered an error while constructing a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}
