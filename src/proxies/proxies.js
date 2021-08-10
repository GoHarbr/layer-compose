// todo. make sure types do not change during execution

import {isFunction}                                from "../utils"
import {TaggedProxy, unwrapProxy, unwrapProxyDeep} from "./utils"

export const definedGetProxy = {
    get(target, prop) {
        return definedGetProxy._get(target, prop, definedGetProxy._get)
    },

    _get(target, prop, innerProxyDefinition) {
        let v = unwrapProxyDeep(target[prop], /* unwrap compositions */ false)

        // v = definedGetProxy._wrapFunction(target, prop, {innerProxyDefinition})

        // null is a valid optional value
        return definedGetProxy._mustBeDefined(v, prop, {innerProxyDefinition})
    },

    _wrapFunction(target, prop, {innerProxyDefinition} = {}) {
        let v = unwrapProxy(target[prop])

        if (isFunction(v)) {
            /* wrap result with defined proxy as well */
            v = definedGetProxy._wrapFunctionReturn(target, prop, {innerProxyDefinition})
        }
        return v
    },

    _wrapFunctionReturn(target, prop, {innerProxyDefinition} = {}) {
        return (...args) => {
            const r = target[prop](...args)
            return typeof r == "object" ? TaggedProxy(r, innerProxyDefinition) : r
        }
    },

    _mustBeDefined(v, prop, {innerProxyDefinition} = {}) {
        if (v !== undefined || typeof prop === 'symbol') {
            // if (typeof v === 'object' && !!v /* if null */) {
            //     return TaggedProxy(v, innerProxyDefinition || definedGetProxy)
            // } else {
                return v
            // }
        }
        throw new Error('Property does not exist (or is `undefined`, eg. check that getter returns): ' + prop);
    }
}

