import {isFunction}                                       from "../utils"
import {$initializedCalls, $runOnInitialize, IS_DEV_MODE} from "../const"
import {definedGetProxy}                                  from "../proxies/proxies"
import {TaggedProxy}                   from "../proxies/utils"
import {noSetAccessProxy}              from "../proxies/noSetAccessProxy"
import generateCaller                  from "../compose/generateCaller"

export function generateSuperAccessor(composedUpTo) {
    /*todo
    *  add ability to curry a function and then use it in another
    *   override a method if the same one is present in this layer
    * */

    return wrap$WithProxy(composedUpTo)
}

const superFunctionProxy = (composition) => ({ // todo composition here is probably unnecessary, use `target`
    get(target, prop) {

        let v = target[prop]
        if (isFunction(v)) {

            /*
            * todo. rewrite so that default opts are combined
            * */
            v = (givenOpts) => {
            // v = () => {
                const fn = function (instance) {
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

export function wrap$WithProxy(composition) {
    return TaggedProxy(composition, superFunctionProxy(composition))
}
