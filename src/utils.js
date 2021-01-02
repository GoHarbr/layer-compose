/* Object that who's keys are not all arrays or composed functions */
import {$dataPointer, $isService, lcSymbol} from "./const"

export function isServiceLayer(l) {
    // todo change to
    // return !Array.isArray(l) && Object.values(l).findIndex(_ => !isFunction(_) && !isLcConstructor(_)) === -1
    return !Array.isArray(l) && Object.values(l).findIndex(_ => !Array.isArray(_) && !isLcConstructor(_)) === -1
}

export function isLcConstructor(what) {
    return what.lcId === lcSymbol
}

export function isService(what) {
    return !!what[$isService]
}

export function mustBeBuilt(l) {
    return isFunction(l)
}

function isFunction(what) {
    return (typeof what === 'function') // fixme, this will not always be correct
}

export function getDataFromPointer(compositionInstance) {
    return compositionInstance[$dataPointer]
}
