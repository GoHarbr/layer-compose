import {$writableKeys} from "../const"

export const noSetAccessProxy = {
    set(target, prop, value) {
        if (typeof prop !== "symbol" && target[$writableKeys] && !target[$writableKeys].includes(prop)) {
            throw new Error('There is no set access on this object')
        } else if (typeof prop === 'symbol' || !target[$writableKeys]) {
            console.warn("No properties should be set on this object ")
        } else {
            target[prop] = value
            return true
        }
    }
}
