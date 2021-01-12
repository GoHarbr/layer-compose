// todo. make sure types do not change during execution

import {$borrowedKeys, $isPrivateData} from "../const"
import {isFunction}                                        from "../utils"
import {isIncompatibleWithProxy, TaggedProxy, unwrapProxy} from "./utils"

const definedProxyExceptions = ['toJSON']

export const definedGetProxy = {
    get(target, prop) {
        return definedGetProxy._get(target, prop, definedGetProxy._get)
    },

    _get(target, prop, innerProxyDefinition) {
        let v = unwrapProxy(target[prop])
        /* todo. do a better job of detecting edge cases as with Set where `add()` can't be called on the proxy
        *  for inspiration https://stackoverflow.com/questions/43927933/why-is-set-incompatible-with-proxy*/

        v = definedGetProxy._wrapFunction(target, v, {innerProxyDefinition})
        // null is a valid optional value
        return definedGetProxy._mustBeDefined(v, prop, {innerProxyDefinition})
    },

    _wrapFunction(target, v, {innerProxyDefinition} = {}) {
        if (isFunction(v)) {
            if (isIncompatibleWithProxy(target)) {
                v = v.bind(target)
            }
            /* wrap result with defined proxy as well */
            const _v = v
            v = (...args) => {
                const r = _v(...args)
                return typeof r == "object" ? TaggedProxy(r, innerProxyDefinition) : r
            }
        }
        return v
    },

    _mustBeDefined(v, prop, {innerProxyDefinition} = {}) {
        if (v !== undefined || typeof prop === 'symbol' || definedProxyExceptions.includes(prop)) {
                if (typeof v === 'object' && !!v /* if null */) {
                    return TaggedProxy(v, innerProxyDefinition || definedGetProxy)
                } else {
                    return v
                }
        }
        throw new Error('Property does not exist: ' + prop)
    }
}

const borrowProxy = (layerId) => ({
    get(target, prop) {
        return definedGetProxy._get(target, prop, borrowProxy(layerId))
    },

    set(target, prop, value) {
        if (typeof prop !== 'symbol'
            // if no borrowed keys set, throw (prevents from runtime generated keys from being settable individually)
            // exception is private data
            && (!target[$borrowedKeys] && !target[$isPrivateData])
            || !target[$borrowedKeys][layerId]
            || !target[$borrowedKeys][layerId].includes(prop)) {
            throw new Error('Must borrow to be able to set a prop\'s value on: ' + prop)
        }

        target[prop] = value
        return true
    }
})

export const noSetAccessProxy = {
    set(target, prop) {
        if (typeof prop !== "symbol") {
            throw new Error('There is no set access on this object')
        } else {
            console.warn("No properties should be set on this object ")
        }
    }
}

export function wrapDataWithProxy(layerId, data, borrow, {isGetOnly}) {
    if (typeof layerId !== "number") throw new Error()
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof data === 'object') {
        if (isGetOnly === true) {
            return TaggedProxy(data, definedGetProxy)
        } else {
            return TaggedProxy(data, borrowProxy(layerId))
        }
    } else {
        /*
        fixme. no longer used
        return the passed in value; useful for recursion */
        return data
    }
}

export function wrapDataConstructorWithProxy(d) {
    /* todo. allow setting values as an alternative to call (`d(defaults)`) syntax*/
    return TaggedProxy(d, noSetAccessProxy)
}

/*
* @deprecated
* */
export function _wrapDataWithProxy(data, borrow, {isGetOnly}) {
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof data === 'object') {
        if (isGetOnly === true) {
            return TaggedProxy(data, definedGetProxy)
        } else {
            return TaggedProxy(data, borrowProxy(Symbol()))
        }
    } else {
        /*
        fixme. no longer used
        return the passed in value; useful for recursion */
        return data
    }
}
