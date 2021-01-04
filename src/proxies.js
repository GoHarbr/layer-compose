// make sure type does not change during execution

import {$borrowedKeys, $dataProxy, $objectId} from "./const"

const definedGetProxy = {
    get(target, prop) {
        const v = target[prop]
        // null is a valid optional value
        return v !== undefined || typeof prop === 'symbol' ? v : throw new Error('Property does not exist: ' + prop)
    }
}

const borrowProxy = (layerId) => ({
    ...definedGetProxy,

    set(target, prop, value) {
        if (target[$borrowedKeys] && typeof prop !== 'symbol'
            && !target[$borrowedKeys][layerId].includes(prop)) {
            throw new Error('Must borrow to be able to set a prop\'s value on: ' + prop)
        }

        target[prop] = value
        return true
    }
})

export function wrapDataWithProxy(layerId, data, borrow, {isGetOnly}) {
    if (typeof layerId !== "symbol") throw new Error()
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof data === 'object') {
        if (typeof borrow == "object") {
            data[$borrowedKeys] = data[$borrowedKeys] || {}

            const addKeys = Object.keys(borrow)
            const existingKeys = Object.values(data[$borrowedKeys]).flat()
            const conflictKey = existingKeys.find(_ => addKeys.some(b => b === _))

            if (conflictKey) {
                throw new Error('Cannot borrow the same key: ' + conflictKey)
            }

            data[$borrowedKeys][layerId] = addKeys
        }

        if (!data[$dataProxy]) {
            if (isGetOnly === true) {
                data[$dataProxy] = new Proxy(data, definedGetProxy)
            } else {
                data[$dataProxy] = new Proxy(data, borrowProxy(layerId))
            }
        }

        /*
        * Wrapping all to prevent subkey setting
        * */
        for (const k of Object.keys(data)) {
            data[k] = wrapDataWithProxy(data[k], typeof borrow == "object" && borrow[k], {isGetOnly})
        }

        return data[$dataProxy]
    } else {
        /* return the passed in value; useful for recursion */
        return data
    }
}

@deprecated
export function _wrapDataWithProxy(data, borrow, {isGetOnly}) {
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof data === 'object') {
        if (typeof borrow == "object") {
            data[$borrowedKeys] = data[$borrowedKeys] || []

            const borrowKeys = Object.keys(borrow)
            const conflictKey = (data[$borrowedKeys]).find(_ => borrowKeys.some(b => b === _))

            if (conflictKey) {
                throw new Error('Cannot borrow the same key: ' + conflictKey)
            }

            data[$borrowedKeys] = [...data[$borrowedKeys], ...borrowKeys]
        }

        if (!data[$dataProxy]) {
            if (isGetOnly === true) {
                data[$dataProxy] = new Proxy(data, definedGetProxy)
            } else {
                data[$dataProxy] = new Proxy(data, borrowProxy)
            }
        }

        /*
        * Wrapping all to prevent subkey setting
        * */
        for (const k of Object.keys(data)) {
            data[k] = wrapDataWithProxy(data[k], typeof borrow == "object" && borrow[k], {isGetOnly})
        }

        return data[$dataProxy]
    } else {
        /* return the passed in value; useful for recursion */
        return data
    }
}

export function wrap$WithProxy($) {

}
