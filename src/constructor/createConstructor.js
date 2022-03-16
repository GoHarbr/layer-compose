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
    $parentInstance,
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
import { core_unsafe } from "../external/patterns/core"

export function createConstructor(layers) {
    if (!layers || layers.length === 0) {
        throw new Error('Layers must be specified')
    } else if (layers.length === 1 && layers[0][$isLc]) {
        return layers[0]
    }

    const _c = _constructor({at: layers[$at]})
    const constructor = _c.bind(_c)

    constructor[$isLc] = true
    constructor[$layers] = layers
    markWithId(constructor)
    wrapWithUtils(constructor)


    _c[$getComposition] = constructor[$getComposition] = async () => {
        const existing = constructor[$composition]
        if (existing) {
            return existing
        }

        const composition = await compose(constructor[$layers], null)
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
    tag,
    singleton,
    parent
}) {
    const compositionInstance = seal(composition)
    wrapStandardMethods(compositionInstance) // for methods like .then

    compositionInstance[$isCompositionInstance] = true
    // compositionInstance[$composition] = composition
    compositionInstance[$lensName] = lensName

    compositionInstance[$tag] = tag
    compositionInstance[$fullyQualifiedName] = fullyQualifiedName || tag

    compositionInstance[$dataPointer] = singleton && core_unsafe(singleton) || singleton || {}
    compositionInstance[$dataPointer][$parentInstance] = parent

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
const _constructor = ({at}) => {
    const location = findLocationFromError(at)
    const { filename } = splitLocationIntoComponents(location)
    const tag = changeCase.pascal(filename.split('/').pop().replace(mjsRe, ''))

    return function (coreObject, cb, {
        lensName,
        fullyQualifiedName,
        singleton,
        parent,
    } = {}) {
        if (!cb && typeof coreObject == 'function') {
            cb = coreObject
            coreObject = null
        }

        if (typeof cb != 'function') throw new Error('Must have callback')

        const readyPromise = new Promise(async (resolve) => {
            try {

                const composition = await this[$getComposition]({})

                // dependency injection
                if (coreObject?.[$isCompositionInstance]) {
                    const $ = findDependency(coreObject, composition, { location })

                    if (!$) {
                        throw new Error('Failed to find dependency')
                    }

                    // todo? get rid of? why needed?
                    // return queueCb($, cb)

                    cb($)

                    resolve([$])
                } else {

                    const [$] = await constructFromComposition(
                        composition,
                        coreObject,
                        {
                            lensName, fullyQualifiedName, singleton, parent, tag
                        })


                    // methods triggered in the callback must not be put into the buffer, ie. executed before other actions

                    resolve([$])
                }

            } catch (e) {
                console.error("layerCompose encountered an error:", e, e.stack)
                if (IS_DEV_MODE) throw e
            }
        })

        return queueCb(readyPromise, cb)
    }
}

function queueCb(p$, cb) {
    // letting the outside know when the callback is executed
    const readyPromise = p$.then(([$]) => new Promise(resolve => {
        queueForExecution($, () => {}, () => {
            cb($)
            resolve([$])
        })
    }))

    // letting the outside queue catches right away
    return {
        catch: (handler) => p$.then(([$]) => {
            $.catch(handler, 'initializer')
        }),

        then: (onResolve, onReject) => {
            return readyPromise.then(([$]) => $.then(onResolve, onReject))
        }
    }
}
