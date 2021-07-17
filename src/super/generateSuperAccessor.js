import {isFunction}                                                                         from "../utils"
import {$dataPointer, $initializedCalls, $parentComposition, $runOnInitialize, IS_DEV_MODE} from "../const"
import {definedGetProxy}                                                                    from "../proxies/proxies"
import {TaggedProxy}                   from "../proxies/utils"
import {noSetAccessProxy}              from "../proxies/noSetAccessProxy"
import generateCaller                  from "../compose/generateCaller"

export function generateSuperAccessor(composedUpTo) {
    const serviceGenerator = (serviceRuntimeGenerator) => {
        const fn = function (instance) {
            let additions
            if (typeof serviceRuntimeGenerator == "function") {
                additions = serviceRuntimeGenerator(instance[$parentComposition], instance[$dataPointer])
            } else {
                additions = serviceRuntimeGenerator
            }

            if (additions) {
                if (typeof additions == 'object') {
                    Object.assign(instance, additions)
                } else {
                    throw new Error("Runtime instance modification must produce an object (named list) of services")
                }
            }
        }

        composedUpTo[$runOnInitialize].unshift(fn)
    }

    return wrap$WithProxy(serviceGenerator, composedUpTo)
}

const superFunctionProxy = (composition) => ({ // todo composition here is probably unnecessary, use `target`
    get(target, prop) {

        let v = composition[prop]
        if (isFunction(v)) {

            /*
            * todo. rewrite so that default opts are combined
            * */
            v = (givenOpts) => {
            // v = () => {
                const fn = function (instance) {

                    /*
                    * Fixme. This should be layer dependannt, though the question of how to deduplicate...
                    * */

                    if (!instance[$initializedCalls].includes(prop)) {
                        instance[prop](givenOpts)
                        instance[$initializedCalls].push(prop)
                    }
                }
                composition[$runOnInitialize].push(fn)

                return v
            }

            v.defaultOpt = (newOpts) => {
                const fn = generateCaller(composition[prop])
                composition[prop] = ($, _, opts) => {
                    return fn($, _, {...newOpts, ...opts})
                }
            }
            v.lockOpt = (newOpts) => {
                const fn = generateCaller(composition[prop])
                composition[prop] = ($, _, opts) => {
                    return fn($, _, {...opts, ...newOpts})
                }
            }

            // todo. function that sets the result combination method
            // v.compressWith = (compressionMethod) => {
            //     target[prop].compressionMethod = compressionMethod
            // }
        }

        return !IS_DEV_MODE ? v : definedGetProxy._mustBeDefined(v, prop, {innerProxyDefinition: superFunctionProxy})
    },
    ...noSetAccessProxy
})

export function wrap$WithProxy(wrapOver, composition) {
    return TaggedProxy(wrapOver, superFunctionProxy(composition))
}
