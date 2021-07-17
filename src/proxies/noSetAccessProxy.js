import {$writableKeys} from "../const"

export const noSetAccessProxy = {
    set(target, prop, value) {
        if (typeof prop !== "symbol" && target[$writableKeys] && !target[$writableKeys].includes(prop)) {
            throw new Error('There is no set access on this object for key: ' + prop)
        } else if (typeof prop === 'symbol' && !(target[$writableKeys] || target[$writableKeys].includes(prop))) {
            // if the key is a Symbol, check that that symbol is registered in $writableKeys
            console.warn("No properties should be set on this object ")
        } else {
            target[prop] = value
            return true
        }
    }
}
