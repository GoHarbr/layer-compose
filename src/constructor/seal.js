import {
    $at,
    $compositionId,
    $dataPointer,
    $fullyQualifiedName,
    $getterNames,
    $isCompositionInstance,
    $isLc,
    $lensName,
    $parentInstance,
    $traceId,
    $writableKeys,
    GETTER_NAMING_CONVENTION_RE,
    IS_DEV_MODE
} from "../const"
import { unwrapProxy } from "../proxies/utils"
import { wrapCompositionWithProxy } from "../proxies/wrapCompositionWithProxy"
import { queueForExecution } from "../compose/queueForExecution"
import { GLOBAL_DEBUG } from "../external/utils/enableDebug"
import { findLocationFromError } from "../external/utils/findLocationFromError"
import core, { core_unsafe } from "../external/patterns/core"
import { trackExternalFunctionCall } from "../auto-type/mapper/mapper"
import defaults from "../external/patterns/defaults"
import constructCoreObject from "./constructCoreObject"
import { isPromise } from "../utils"
import debugCoreUpdate from "./debugCoreUpdate"


const PRIMORDIAL_LEVEL = 0
let debugId = 1

export default function seal(composition) {
    const $ = function (arg) {
        if (IS_DEV_MODE) {
            if (typeof arg !== 'object' && !arg?.[$isCompositionInstance]) throw new Error('Only objects or compositions are allowed currently')
            if (Array.isArray(arg) && arg.find(e => e === undefined)) throw new Error(`Likely a Promise.all() was yielded/returned from a generator function`)
        }
        debugCoreUpdate($)

        let coreUpdate

        queueForExecution($, async () => coreUpdate = arg && await constructCoreObject(arg), () => {

            // pass on the message
            queueForExecution($, () => {
                if (coreUpdate !== undefined) {
                    $._ && $._(coreUpdate)

                    // runs after
                    if (coreUpdate) {
                        queueForExecution($, () => {
                            const c = core($, PRIMORDIAL_LEVEL)
                            defaults(c, coreUpdate)
                        }, null, { prepend: true })
                    }
                }
            }, null, { prepend: true })

        }, { prepend: true })


        return $
    }

    $[$writableKeys] = [$parentInstance, $lensName]
    $[$dataPointer] = null
    $[$compositionId] = composition[$compositionId]
    $[$getterNames] = []
    if (IS_DEV_MODE) $[$traceId] = debugId++

    // clearing existing methods
    $.call = $.bind = $.apply = undefined

    // sealing methods, lenses and accessors
    for (const name in composition) {
        const methodOrLens = composition[name]
        if (typeof name == "symbol") continue


        if (methodOrLens[$isLc]) {
            const at = composition[$at]
            $[name] = sealLens(methodOrLens, $, { name, at })
        } else {
            const isGetter = GETTER_NAMING_CONVENTION_RE.test(name)
            if (isGetter) {
                Object.defineProperty($, name, { get: sealMethod(methodOrLens, $, { name }) })
                $[$getterNames].push(name)
            } else {
                $[name] = sealMethod(methodOrLens, $, { name })
            }
        }
    }

    return $
}


function sealLens(lensConstructor, parent, { name, at }) {
    function makeLens(cbOrCore, cb) {
        let lensCore = null
        let cbWithService

        if (typeof cbOrCore === 'function' && !cbOrCore[$isCompositionInstance]) {
            lensCore = {}
            cbWithService = cbOrCore
        } else {
            lensCore = cbOrCore
            cbWithService = cb
        }

        if (!cbWithService) throw new Error("Callback must be present to access the service")

        parent = IS_DEV_MODE ? wrapCompositionWithProxy(parent) : parent

        const fullyQualifiedName = (parent[$fullyQualifiedName] || '') + `.${name}`
        const diagnostics = !IS_DEV_MODE ? null : (symbol) => {
            if (GLOBAL_DEBUG.enabled) {
                const header = `${symbol.padEnd(3)}  ${''.padEnd(25)}  ${fullyQualifiedName}`
                console.debug(`${header.padEnd(95)} :: ${findLocationFromError(new Error())}`)
            }
        }


        let catchFn
        const creationPromise = new Promise(async (resolveWhenCreated, rejectWhenInstantiated) => {

            diagnostics && diagnostics('|>>')

            // singleton mechanism
            const pCore = core_unsafe(parent)
            const isSingleton = name in pCore
            let resolveWithSingleton

            let singletonFrom
            if (isSingleton) {
                if (lensCore[$isCompositionInstance]) {
                    throw new Error("Dependency injection cannot be done through a Lens if it's also singleton")
                }

                diagnostics && diagnostics('@')

                singletonFrom = pCore[name]
                if (isPromise(singletonFrom)) {
                    await singletonFrom
                    singletonFrom = pCore[name]
                }

                // todo. verify type!!
                if (singletonFrom?.[$isCompositionInstance]) {
                    singletonFrom.catch(rejectWhenInstantiated, 'initializer')

                    // resolveWhenCreated(cbWithService(singletonFrom))
                    resolveWhenCreated([singletonFrom])

                    // ! shortcut
                    return

                } else {
                    // setting a placeholder, in case of concurrent lens access
                    pCore[name] = new Promise(res => resolveWithSingleton = res)
                }

                lensCore = { ...singletonFrom, ...lensCore }
            }

            lensConstructor(lensCore, $ => {
                // giving singleton for future use
                if (isSingleton) {
                    pCore[name] = $
                    resolveWithSingleton()
                }

                //
                // const r = cbWithService($)
                // r && typeof r == 'object' && "catch" in r && r.catch(e => console.error(`ERROR during instantiation >> ${fullyQualifiedName} () lens`, e))

                $.removeCatch('lens-initializer')
                resolveWhenCreated([$])
            }, {
                lensName: name,
                fullyQualifiedName,
                singleton: singletonFrom,
                parent,
            })
                .catch((e, $) => {
                    catchFn && catchFn()
                    rejectWhenInstantiated(e) // todo. prevent rejecting after resolution

                    // keeping singleton for future use, even though it failed
                    if (isSingleton) {
                        pCore[name] = $
                        resolveWithSingleton()
                    }
                }, 'lens-initializer')
        })

        const cbPromise = creationPromise.then(([$]) => cbWithService($))

        // letting the outside catch right away
        return {
            catch: (handler) => {
                catchFn = handler
                return creationPromise.then(([$]) => {
                    $.catch(handler, 'custom-lens-initializer')
                })
            },

            then: (onResolve, onReject) => {
                return cbPromise.then(onResolve, onReject)
            }
        }
    }

    makeLens.mock = lensConstructor.mock

    return makeLens
}

function sealMethod(method, $, { name }) {
    const isGetter = GETTER_NAMING_CONVENTION_RE.test(name)

    return function (opt, ...rest) {
        if (IS_DEV_MODE) {
            if (!!opt && rest.length) {
                throw new Error("Layer methods can take only named parameters/options or a single argument")
            }
        }

        // ! here's the catch!!
        // do not re-set $dataPointer past this point, it's cached from here on out
        const _ = IS_DEV_MODE ? unwrapProxy($[$dataPointer]) : $[$dataPointer]

        if (GLOBAL_DEBUG.enabled) {
            const at = new Error()
            const fullyQualifiedName = $[$fullyQualifiedName]
            const header = `~~   ${name.padEnd(25)}  ${fullyQualifiedName}`
            console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at) || ''}`)

            trackExternalFunctionCall(fullyQualifiedName, name, $[$compositionId], at)
        }


        const res = method($, _, optOrEmpty(opt))

        if (IS_DEV_MODE && isGetter && isPromise(res)) {
            throw new Error("Getters must not return promises, they must be synchronous")
        }

        return isGetter ? res : $
    }

}

function optOrEmpty(what) {
    return what == null ? {} : what
}
