import {IS_DEV_MODE}                                               from "../const"
import {isService, isFunction, getDataFromPointer}                 from "../utils"
import {_wrapDataWithProxy, wrapDataWithProxy, wrapSuperWithProxy} from "../proxies/proxies"

export function generateSuperAccessor(composedUpTo) {
    const selfInstancePointer = {
        pointer: undefined
    }

    /*todo
    *  add ability to curry a function and then use it in another
    *   override a method if the same one is present in this layer
    * */

    return {
        initializer: compositionInstance => {
            selfInstancePointer.pointer = compositionInstance
        },
        constructor: generateConstructor(composedUpTo, selfInstancePointer)
    }
}

function generateConstructor(composedUpTo, selfInstancePointer) {
    attachModifiers(composedUpTo)
    composedUpTo = wrapSuperWithProxy(composedUpTo, selfInstancePointer) // in DEV mode checks for defined gets

    return composedUpTo
}

/* todo. move into the get proxy */
function attachModifiers(composition) {
    for (const k of Object.keys(composition)) {
        const v = composition[k]
        if (!isService(v)) {
            /*
            * If this check ever goes, and we can overrides services, make sure that in the constructor we create
            * a copy of the service in `asService()`
            * */
            if (!isFunction(v)) throw new Error('Programmer error: `v` should be a method')

            // todo. is setting composition[k] modifies it across several layerCompose instances? // bad wording
            v.override = (fn) => {
                if (!isFunction(fn)) {
                    if (fn !== null) {
                        throw new Error('Override must be a function or null (mute execution)')
                    } else {
                        composition[k] = undefined

                        return /* remove method & exit */
                    }
                }

                composition[k] = (data, opts) => {
                    const superMethod = (superOpts) => {
                        if (!superOpts) superOpts = opts
                        return v(data, superOpts)
                    }
                    fn(superMethod, data, opts)
                }
            }

            v.defaultOpt = (newOpts) => composition[k] = (data, opts) => {
                return v(data, {...newOpts, ...opts})
            }
            v.overwriteOpt = (newOpts) => composition[k] = (data, opts) => {
                return v(data, {...opts, ...newOpts})
            }
        }
    }
}