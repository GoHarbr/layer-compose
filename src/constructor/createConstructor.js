import {
    $at,
    $composition,
    $compositionId,
    $dataPointer,
    $fullyQualifiedName,
    $getComposition,
    $isCompositionInstance,
    $isLc,
    $layers,
    $lensName,
    $tag,
    IS_DEV_MODE
}                                  from "../const"
import {wrapCompositionWithProxy}  from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods         from "./wrapStandardMethods"
import compose                     from "../compose/compose"
import seal                        from "./seal"
import initialize                  from "./initialize"
import {queueForExecution}         from "../compose/queueForExecution"
import {markWithId}                from "../compose/markWithId"
import {findLocationFromError}     from "../external/utils/findLocationFromError"
import splitLocationIntoComponents from "../external/utils/splitLocationIntoComponents"
import {wrapWithUtils}             from "./wrapWithUtils"
import changeCase from 'case'

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
        _c[$tag] = name
        return constructor
    }

    return constructor
}

export async function constructFromComposition(composition, coreObject, {
    lensName,
    fullyQualifiedName,
    preinitializer,
    tag
}) {
    const compositionInstance = seal(composition)
    wrapStandardMethods(compositionInstance) // for methods like .then
    wrapWithUtils(compositionInstance)

    compositionInstance[$isCompositionInstance] = true
    // compositionInstance[$composition] = composition
    compositionInstance[$lensName] = lensName

    compositionInstance[$tag] = tag
    compositionInstance[$fullyQualifiedName] = fullyQualifiedName || tag

    compositionInstance[$dataPointer] = {}

    initialize(compositionInstance, coreObject) // no need to wrap in queueForExecution
    // preinitializer runs first, thus must be queued last
    preinitializer && queueForExecution(compositionInstance, () => preinitializer(compositionInstance), null, { next: true })

    if (IS_DEV_MODE) {
        return [wrapCompositionWithProxy(compositionInstance)]
    } else {
        return [compositionInstance]
    }
}

const mjsRe = /m?js/
const _constructor = (layers) => {
    const location = findLocationFromError(layers[$at])
    const { filename } = splitLocationIntoComponents(location)
    const tag = changeCase.pascal(filename.split('/').pop().replace(mjsRe, ''))

    return async function (coreObject, cb, {
        lensName,
        fullyQualifiedName,
        preinitializer,
        parent
    } = {}) {
        try {
            const [$] = await constructFromComposition(
                await this[$getComposition](),
                coreObject,
                {
                    lensName, fullyQualifiedName, preinitializer, tag
                })

            // todo. why not call CB right away? might not make much of a difference
            queueForExecution($, () => {
                cb($)
            })

        } catch (e) {
            console.error("layerCompose encountered an error while constructing a composition:", e, e.stack)
            if (IS_DEV_MODE) throw e
        }
    }
}
