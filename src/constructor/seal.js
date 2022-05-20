import {
    $at,
    $compositionId,
    $dataPointer,
    $fullyQualifiedName,
    $getterNames,
    $isCompositionInstance,
    $isLc,
    $isWrappedCompositionInstance,
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
import { core_unsafe } from "../external/patterns/core"
import { trackExternalFunctionCall } from "../auto-type/mapper/mapper"
import constructCoreObject from "./constructCoreObject"
import { isAwaitable, isPromise } from "../utils"
import debugCoreUpdate from "./debugCoreUpdate"

// todo switch to using Symbol because of int overflow

let traceId = 1

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
                }
            }, null, { prepend: true })

        }, { prepend: true })

        return $
    }

    $[$writableKeys] = [$parentInstance, $lensName]
    $[$dataPointer] = null
    $[$compositionId] = composition[$compositionId]
    $[$getterNames] = []
    $[$traceId] = traceId++

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
                const getter = sealMethod(methodOrLens, $, { name, isGetter })

                // TODO
                //   does not make sense -- pre-getter needs to be awaited
                //   or does it? What if it's a non async function?

                // const preGetterName = name.slice(1) // todo change if getter convention changes
                // const preGetter = composition[preGetterName] ?
                //     sealMethod(composition[preGetterName], $, { name: preGetterName, isGetter }) : null
                // if (preGetter && typeof preGetter == 'function') {
                //     Object.defineProperty($, name, {
                //         get: () => {
                //             const pgr = preGetter()
                //             if (IS_DEV_MODE) {
                //                 if (pgr instanceof Promise) throw new Error('Pre-accessor call functions cannot be async!')
                //             }
                //
                //             return getter()
                //         }
                //     })
                // } else {
                    // }
                Object.defineProperty($, name, { get: getter })
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

        diagnostics && diagnostics('|>>')

        // singleton mechanism
        const pCore = core_unsafe(parent)
        const isSingleton = name in pCore
        let resolveWithSingleton

        let singletonSeed
        if (isSingleton) {
            if (lensCore[$isCompositionInstance]) {
                throw new Error("Dependency injection cannot be done through a Lens if it's also singleton")
            }

            singletonSeed = pCore[name]
            if (!singletonSeed || !isAwaitable(singletonSeed)) {
                // setting a placeholder, in case of concurrent lens access
                pCore[name] = new Promise(res => resolveWithSingleton = res).then(r => {
                    if (!r) return // can happen if singleton failed to initialize
                    pCore[name] = r.$
                    return r
                })
                lensCore = { ...singletonSeed, ...lensCore }

                diagnostics && diagnostics('@@')
            } else {
                diagnostics && diagnostics('@')
            }
        }

        return lensConstructor(lensCore, $ => {
            // giving singleton for future use, only if it's not already set
            if (isSingleton && resolveWithSingleton) {
                resolveWithSingleton({
                    $, [$isWrappedCompositionInstance]: true
                })
                resolveWithSingleton = null // preventing double call in `catch`
            }

            return cbWithService($)
        }, {
            lensName: name,
            fullyQualifiedName,
            singleton: singletonSeed,
            parent,
        })
    }

    makeLens.mock = lensConstructor.mock
    makeLens.inject = cb => lensConstructor.inject(parent, cb)

    return makeLens
}

function sealMethod(method, $, { name, isGetter }) {
    isGetter = isGetter || GETTER_NAMING_CONVENTION_RE.test(name)

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
