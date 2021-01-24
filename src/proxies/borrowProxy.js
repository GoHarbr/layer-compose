import {$borrowedKeys} from "../const"
import {definedGetProxy}               from "./proxies"
import {unwrapProxy}                   from "./utils"

export const borrowProxy = (layerId) => ({
    get(target, prop) {
        return definedGetProxy._get(target, prop, borrowProxy(layerId))
    },

    set(target, prop, value) {
        if (value === undefined) {
            throw new Error('Not allow to set values to `undefined`')
        }

        value = unwrapProxy(value)

        if (typeof prop !== 'symbol') {
            if (!target.hasOwnProperty($borrowedKeys)) {
                target[$borrowedKeys] = {}
            } else if (!!target[$borrowedKeys][prop] && target[$borrowedKeys][prop] !== layerId) {
                throw new Error('Must borrow to be able to set a prop\'s value on: ' + prop)
            }

            target[$borrowedKeys][prop] = layerId
        }

        target[prop] = value
        return true
    }
})
