import {isFunction}                    from "../utils"
import {$runOnInitialize, IS_DEV_MODE} from "../const"
import {definedGetProxy}               from "../proxies/proxies"
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
        /* todo
        *   check that the prop is a getter and return a corresponding function */
        let v = target[prop]
        if (isFunction(v)) {

            v = (givenOpts) => {
                const fn = function (instance) {
                    instance[prop](givenOpts)
                }
                composition[$runOnInitialize].push(fn)
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
            v.compressWith = (compressionMethod) => {
                target[prop].compressionMethod = compressionMethod
            }
        }

        return !IS_DEV_MODE ? v : definedGetProxy._mustBeDefined(v, prop, {innerProxyDefinition: superFunctionProxy})
    },
    ...noSetAccessProxy
})

export function wrap$WithProxy(composition) {
    return TaggedProxy(composition, superFunctionProxy(composition))
}
