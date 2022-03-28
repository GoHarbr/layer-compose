import {
    $at,
    $composition,
    $compositionId,
    $currentExecutor,
    $getComposition,
    $isCompositionInstance,
    $isLc,
    $layers,
    $parentInstance,
    $tag,
    $traceId,
    IS_DEV_MODE
} from "../const"
import compose from "../compose/compose"
import { getExecutionQueue, queueForExecution } from "../compose/queueForExecution"
import { markWithId } from "../compose/markWithId"
import { findLocationFromError } from "../external/utils/findLocationFromError"
import splitLocationIntoComponents from "../external/utils/splitLocationIntoComponents"
import { wrapWithUtils } from "./wrapWithUtils"
import changeCase from 'case'
import { findDependency } from "../external/patterns/findDependency"
import { core_unsafe } from "../external/patterns/core"
import { is } from '../external/patterns/is'
import { constructFromComposition } from "./compositionToInstance"

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
                // if not a composition, then it's a wrapped instance
                singleton = singleton?.[$isCompositionInstance] ? singleton : (await singleton)?.$
                if (singleton) {
                    // singleton mechanism
                    resolve([singleton])

                } else {
                    const composition = await this[$getComposition]({})

                    if (coreObject?.[$isCompositionInstance]) {
                        if (is(coreObject, composition)) {
                            // passthrough, same type

                            queueForExecution(coreObject, () => {
                                const existingParent = core_unsafe(coreObject)?.[$parentInstance]
                                if ((parent && !existingParent) || (existingParent && !parent) || parent[$traceId] !==  existingParent[$traceId]) {
                                    throw new Error("Compositions pass-through cannot happen because the parents do not match")
                                }
                                resolve([coreObject])
                            })

                        } else {
                            // dependency injection
                            const $ = findDependency(coreObject, composition, { location })

                            if (!$) {
                                throw new Error('Failed to find dependency')
                            }

                            resolve([$])
                        }
                    } else {

                        const [$] = await constructFromComposition(
                            composition,
                            coreObject,
                            {
                                lensName, fullyQualifiedName, singleton, parent, tag
                            })


                        // methods triggered in the callback must not be put into the buffer, ie. executed before other
                        // actions

                        resolve([$])
                    }
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
    const readyPromise = p$.then(async ([$]) => {
        await cb($)
    })

    // letting the outside queue catch right away
    return {
        catch: (handler, id) => p$.then(([$]) => {
            // fixme. Will this result in multiple of the same catches for singletons?
            return new Promise((resolve) => {
                $.catch((e,$) => {
                    const r = handler(e,$)
                    resolve && resolve(r)
                }, id)

                readyPromise.then(resolve, (e) => {
                    getExecutionQueue($)[$currentExecutor].fail(e)
                    resolve && resolve()
                })
            })
        }),

        then: (onResolve, onReject) => {
            return readyPromise.then(onResolve, onReject)
        }
    }
}
