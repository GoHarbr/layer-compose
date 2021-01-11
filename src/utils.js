/* Object that who's keys are not all arrays or composed functions */
import {$dataPointer, $isService, $layerId, LC_SYMBOL} from "./const"
import {layerBuilderFormatCheck}                       from "./dev-checks"

export function isServiceLayer(l) {
    if (!Array.isArray(l)) {
        const propDescriptors = Object.getOwnPropertyDescriptors(l)
        const getters = Object.values(propDescriptors).filter(_ => !!_.get)
        if (getters.length > 0) {
            return false
        }
        return Object.values(l).findIndex(_ => !Array.isArray(_) && !isLcConstructor(_) && !isService(_)) === -1
    }
    return false
}

export function isFragmentOfLayers(what) {
    return Array.isArray(what) || isLcConstructor(what)
}

export function isLcConstructor(what) {
    return what.lcId === LC_SYMBOL
}

export function isService(what) {
    return (typeof what == "object") && !!what[$isService]
}

export function isLayerBuilder(l) {
    const res = isFunction(l)
    // runs only in dev mode
    res && layerBuilderFormatCheck(l)
    return res
}

export function isConstructorLayer(what) {
    return isFunction(what) && what.length === 1
}

export function isFunction(what) {
    return (typeof what === 'function') // fixme, this will not always be correct
}

export function isPromise(what) {
    return what && typeof what == "object" && ("then" in what) && isFunction(what.then)
}

export function getDataFromPointer(compositionInstance) {
    return compositionInstance[$dataPointer]
}

export function selectExistingServices(composition) {
    /*
    * Do not change implementation, create new function
    * */
    return Object.fromEntries(
        Object.entries(composition).filter(_ => isService(_[1]))
    )
}

let _globalLayerId = 0
export function getLayerId(layer) {
    _globalLayerId++
    return layer[$layerId] || (layer[$layerId] = _globalLayerId)
}

export function renameIntoGetter(functionName) {
    if (functionName.startsWith('get')) {
        let propName = functionName.replace('get', '')
        return propName
            && propName[0].toLowerCase() + propName.slice(1)
    }
}

export function isIncompatibleWithProxy(what) {
    /* todo. improve this check, not fully reliable as is */
    return !!what && typeof what == "object" && (
        Array.isArray(what)
         || (Symbol.iterator in what)
         || (Symbol.asyncIterator in what)
         || what instanceof Set
         || what instanceof WeakSet
         || what instanceof Map
         || what instanceof WeakMap
         || what instanceof Promise
    )
}
