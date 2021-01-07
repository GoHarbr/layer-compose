// todo. make sure types do not change during execution

import {$borrowedKeys, $isPrivateData, IS_DEV_MODE} from "../const"
import {getDataFromPointer, isFunction}             from "../utils"

const definedProxyExceptions = ['toJSON']

const definedGetProxy = {
    get(target, prop) {
        const v = target[prop]
        // null is a valid optional value
        return definedGetProxy._mustBeDefined(v, prop)
    },

    _mustBeDefined(v, prop, {innerProxyDefinition} = {}) {
        return v !== undefined || typeof prop === 'symbol' || definedProxyExceptions.includes(prop)
            ? (typeof v === 'object' ? new Proxy(v, innerProxyDefinition || definedGetProxy) : v)
            : throw new Error('Property does not exist: ' + prop)
    }
}

const borrowProxy = (layerId) => ({
    get(target, prop) {
        const v = target[prop]
        // null is a valid optional value
        return definedGetProxy._mustBeDefined(v, prop, {innerProxyDefinition: borrowProxy(layerId)})
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

const noSetAccessProxy = {
    set() {
        throw new Error('There is no set access on this object')
    }
}

const superFunctionProxy = (selfInstancePointer, {getProxy} = {}) => ({
    get(target, prop) {
        /* todo
        *   check that the prop is a getter and return a corresponding function */
        const v = target[prop]
        if (isFunction(v)) {
            return opt => {
                return v(getDataFromPointer(selfInstancePointer.pointer), opt)
            }
        } else {
            return getProxy ? getProxy(v, prop) : v
        }
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

export function wrapSuperWithProxy(composition, selfInstancePointer) {
    const getProxy = IS_DEV_MODE ? definedGetProxy._mustBeDefined : undefined
    return new Proxy(composition, superFunctionProxy(selfInstancePointer, {getProxy}))
}

export function wrapDataConstructorWithProxy(d) {
    return new Proxy(d, noSetAccessProxy)
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
