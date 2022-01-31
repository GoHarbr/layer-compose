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
} from "../const"
import { wrapCompositionWithProxy } from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods from "./wrapStandardMethods"
import compose from "../compose/compose"
import seal from "./seal"
import initialize from "./initialize"
import { queueForExecution } from "../compose/queueForExecution"
import { markWithId } from "../compose/markWithId"
import { findLocationFromError } from "../external/utils/findLocationFromError"
import splitLocationIntoComponents from "../external/utils/splitLocationIntoComponents"
import { wrapWithUtils } from "./wrapWithUtils"
import changeCase from 'case'
import { findDependency } from "../external/patterns/findDependency"

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
    wrapWithUtils(constructor)


    _c[$getComposition] = constructor[$getComposition] = async ({tag = null} = {}) => {
        const existing = constructor[$composition]
        if (existing) {
            if (!existing[$tag] && tag) {
                existing[$tag] = tag
            } else if (existing[$tag] && tag && tag !== existing[$tag]) {
                debugger
            }
            return existing
        }

        const composition = await compose(layers, null)
        composition[$compositionId] = constructor[$compositionId]
        composition[$tag] = tag

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
}) {
    const compositionInstance = seal(composition)
    wrapStandardMethods(compositionInstance) // for methods like .then

    compositionInstance[$isCompositionInstance] = true
    // compositionInstance[$composition] = composition
    compositionInstance[$lensName] = lensName

    const tag = compositionInstance[$tag] = composition[$tag]
    compositionInstance[$fullyQualifiedName] = fullyQualifiedName || tag

    compositionInstance[$dataPointer] = {}

    initialize(compositionInstance, coreObject)
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
        if (!cb && typeof coreObject == 'function') {
            cb = coreObject
            coreObject = null
        }
        try {

        const composition = await this[$getComposition]({tag})

        if (coreObject[$isCompositionInstance]) {
            const $ = findDependency(coreObject, composition, {location})

            if (!$) {
                throw new Error('Failed to find dependency')
            }

            queueCb($, cb)
        } else {

                const [$] = await constructFromComposition(
                    composition,
                    coreObject,
                    {
                        lensName, fullyQualifiedName, preinitializer
                    })

                // methods triggered in the callback must not be put into the buffer, ie. executed before other actions
                queueCb($, cb)
        }

        } catch (e) {
            console.error("layerCompose encountered an error:", e, e.stack)
            if (IS_DEV_MODE) throw e
        }

    }
}

function queueCb($, cb) {
    return queueForExecution($, () => {}, () => cb($))
}
