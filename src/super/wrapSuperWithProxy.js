import {isFunction, isService}             from "../utils"
import {IS_DEV_MODE}                       from "../const"
import {definedGetProxy, noSetAccessProxy} from "../proxies/proxies"
import functionReturnDefinition            from "../proxies/functionReturnDefinition"
import {TaggedProxy}                       from "../proxies/utils"

const superFunctionProxy = (composition, selfInstancePointer) => ({
    get(target, prop) {
        /* todo
        *   check that the prop is a getter and return a corresponding function */
        let v = target[prop]
        if (isFunction(v)) {
            const originalFn = v

            v = opt => {
                return selfInstancePointer.pointer[prop](opt)
            }

            if (IS_DEV_MODE) {
                v = definedGetProxy._wrapFunctionReturn(v, {innerProxyDefinition: functionReturnDefinition})
            }

            v.defaultOpt = (newOpts) => {
                composition[prop] = (data, opts) => {
                    return originalFn(data, {...newOpts, ...opts})
                }
            }
            v.lockOpt = (newOpts) => {
                composition[prop] = (data, opts) => {
                    return originalFn(data, {...opts, ...newOpts})
                }
            }

        }

        return !IS_DEV_MODE ? v : definedGetProxy._mustBeDefined(v, prop, {innerProxyDefinition: superFunctionProxy})
    },
    ...noSetAccessProxy
})

export function wrapSuperWithProxy(composition, selfInstancePointer) {
    return TaggedProxy(composition, superFunctionProxy(composition, selfInstancePointer))
}


/* todo. move into the proxy */
// function attachModifiers(composition) {
//     for (const k of Object.keys(composition)) {
//         const v = composition[k]
//         if (!isService(v)) {
//             /*
//             * If this check ever goes, and we can overrides services, make sure that in the constructor we create
//             * a copy of the service in `asService()`
//             * */
//             if (!isFunction(v)) throw new Error('Programmer error: `v` should be a method')
//
//             // todo. is setting composition[k] modifies it across several layerCompose instances? // bad wording
//             v.override = (fn) => {
//                 if (!isFunction(fn)) {
//                     if (fn !== null) {
//                         throw new Error('Override must be a function or null (mute execution)')
//                     } else {
//                         composition[k] = undefined
//
//                         return /* remove method & exit */
//                     }
//                 }
//
//                 composition[k] = (data, opts) => {
//                     const superMethod = (superOpts) => {
//                         if (!superOpts) superOpts = opts
//                         return v(data, superOpts)
//                     }
//                     fn(superMethod, data, opts)
//                 }
//             }
//
//
//         }
//     }
// }
