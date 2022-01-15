import {
    $composition, $compositionId,
    $dataPointer,
    $fullyQualifiedName,
    $getComposition,
    $isCompositionInstance,
    $isLc,
    $layers,
    $lensName,
    IS_DEV_MODE
} from "../const"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods        from "./wrapStandardMethods"
import constructCoreObject        from "./constructCoreObject"
import compose                    from "../compose/compose"
import seal                       from "./seal"
import initialize                 from "./initialize"
import {queueForExecution}        from "../compose/queueForExecution"
import {markWithId}               from "../compose/markWithId"

export function createConstructor(layers) {
    if (!layers || layers.length === 0) {
        throw new Error('Layers must be specified')
    } else if (layers.length === 1 && layers[0][$isLc]) {
        return layers[0]
    }

    const _c = _constructor(layers)
    const constructor = _c.bind(_c)

    constructor[$isLc] = true
    constructor[$layers] = layers
    markWithId(constructor)


    _c[$getComposition] = constructor[$getComposition] = async () => {
        const existing = constructor[$composition]
        if (existing) return existing

        const composition = await compose(layers, null)
        composition[$compositionId] = constructor[$compositionId]
        return constructor[$composition] = composition
    }

    constructor.tag = (name) => {
        constructor.TAG = name
        return constructor
    }

    return constructor
}

export async function constructFromComposition(composition, coreObject, {
    lensName,
    fullyQualifiedName,
    preinitializer,
    parent
}) {
    const compositionInstance = seal(composition, Object.create(null))
    wrapStandardMethods(compositionInstance) // for methods like .then

    compositionInstance[$isCompositionInstance] = true
    // compositionInstance[$composition] = composition
    compositionInstance[$lensName] = lensName
    compositionInstance[$fullyQualifiedName] = fullyQualifiedName

    const core = await constructCoreObject(coreObject, composition)
    compositionInstance[$dataPointer] = core

    preinitializer && queueForExecution(compositionInstance, () => preinitializer(compositionInstance))
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
    preinitializer,
    parent
} = {}) {
    try {
        const [$] = await constructFromComposition(
            await this[$getComposition](),
            coreObject,
            { lensName, fullyQualifiedName, preinitializer, parent })

        // todo. why not call CB right away? might not make much of a difference
        queueForExecution($, () => {
            cb($)
        })

    } catch (e) {
        console.error("layerCompose encountered an error while constructing a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}
