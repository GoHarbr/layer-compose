import {IS_DEV_MODE}           from "./const"
import {isService, isFunction} from "./utils"
import {wrapDataWithProxy}     from "./proxies"

export function generateSuperAccessor(composedUpTo) {
    attachModifiers(composedUpTo)

    if (IS_DEV_MODE) {
        // fixme. create wrap$WithProxy
        return wrapDataWithProxy(composedUpTo, {/* empty borrow, thus no setting */}, {isGetOnly: false})
    } else {
        return composedUpTo
    }
}

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
