// make sure type does not change during execution

import {$borrowedKeys, $dataProxy, $isPrivateData, $objectId} from "./const"

const definedGetProxy = {
    get(target, prop) {
        const v = target[prop]
        // null is a valid optional value
        return v !== undefined || typeof prop === 'symbol'
            ? (typeof v === 'object' ? new Proxy(v, definedGetProxy) : v)
            : throw new Error('Property does not exist: ' + prop)
    }
}

const borrowProxy = (layerId) => ({
    get(target, prop) {
        const v = target[prop]
        // null is a valid optional value
        return v !== undefined || typeof prop === 'symbol'
            ? (typeof v === 'object' ? new Proxy(v, borrowProxy(layerId)) : v)
            : throw new Error('Property does not exist: ' + prop)
    },

    set(target, prop, value) {
        if (typeof prop !== 'symbol'
            // if no borrowed keys set, throw (prevents from runtime generated keys from being settable individually)
            // exception is private data
            && (!target[$borrowedKeys] && !target[$isPrivateData])
            || !target[$borrowedKeys][layerId].includes(prop)) {
            throw new Error('Must borrow to be able to set a prop\'s value on: ' + prop)
        }

        target[prop] = value
        return true
    }
})

export function wrapDataWithProxy(layerId, data, borrow, {isGetOnly}) {
    if (typeof layerId !== "number") throw new Error()
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof data === 'object') {
        if (isGetOnly === true) {
            return new Proxy(data, definedGetProxy)
        } else {
            return new Proxy(data, borrowProxy(layerId))
        }
    } else {
        /*
        fixme. no longer used
        return the passed in value; useful for recursion */
        return data
    }
}

/*
* @deprecated
* */
export function _wrapDataWithProxy(data, borrow, {isGetOnly}) {
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof data === 'object') {
        if (isGetOnly === true) {
            return new Proxy(data, definedGetProxy)
        } else {
            return new Proxy(data, borrowProxy(Symbol()))
        }
    } else {
        /*
        fixme. no longer used
        return the passed in value; useful for recursion */
        return data
    }
}

export function wrap$WithProxy($) {

}
