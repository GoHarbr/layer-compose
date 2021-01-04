/* Object that who's keys are not all arrays or composed functions */
import {$dataPointer, $isService, $layerId, LC_SYMBOL} from "./const"
import {layerBuilderFormatCheck}                       from "./dev-checks"

export function isServiceLayer(l) {
    return !Array.isArray(l) && Object.values(l).findIndex(_ => !Array.isArray(_) && !isLcConstructor(_)) === -1
}

export function isFragmentOfLayers(what) {
    return Array.isArray(what) || isLcConstructor(what)
}

export function isLcConstructor(what) {
    return what.lcId === LC_SYMBOL
}

export function isService(what) {
    return !!what[$isService]
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
