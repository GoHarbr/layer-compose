import { $borrowedKeys } from "../const"
import { definedGetProxy } from "./proxies"
import { unwrapProxy } from "./utils"
import { GLOBAL_DEBUG } from "../external/utils/enableDebug"
import { findLocationFromError } from "../external/utils/findLocationFromError"

export const borrowProxy = (layerId) => ({
    get(target, prop) {
        if (target.__debug || GLOBAL_DEBUG.enabled) {
            const at = new Error()
            const header = `+    '${prop}' read`
            console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at)}`)
        }

        return definedGetProxy._get(target, prop, borrowProxy(layerId))
    },

    set(target, prop, value) {
        if (value === undefined) {
            throw new Error('Not allow to set values to `undefined`')
        }

        value = unwrapProxy(value)

        if (typeof prop !== 'symbol') {
            if (layerId === null) {
                throw new Error('Not allowed to set values on a core outside of a Composition')
            }

            if (!target.hasOwnProperty($borrowedKeys)) {
                target[$borrowedKeys] = {}
            } else if (!!target[$borrowedKeys][prop] && target[$borrowedKeys][prop] !== layerId) {
                console.error('Already borrowed : ' + prop, target[$borrowedKeys][prop + '_stack'])
                throw new Error('Must borrow to be able to set a prop\'s value on: ' + prop + ` [${layerId[Symbol.toStringTag]}]`)
            }

            target[$borrowedKeys][prop] = layerId

            if (target.__debug || GLOBAL_DEBUG.enabled) {
                const at = new Error()
                const header = `-    '${prop}' set`
                console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at)}`)
                target[$borrowedKeys][prop + '_stack'] = at
            }
        }

        target[prop] = value
        return true
    }
})
