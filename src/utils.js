/* Object that who's keys are not all arrays or composed functions */
import {$dataPointer, $isLc, $isService, $layerId} from "./const"
import {unwrapProxy}                               from "./proxies/utils"

/* isType checks // todo move */

export function isServiceLayer(l) {
    if (!Array.isArray(l)) {
        const propDescriptors = Object.getOwnPropertyDescriptors(l)
        const getters = Object.values(propDescriptors).filter(_ => !!_.get)
        if (getters.length > 0) {
            return false
        }

        /* every single value should be either an array, a constructor, marked as a service and not a function */
        return Object.values(l)
            .findIndex(_ =>
                !Array.isArray(_)
                && !isLcConstructor(_)
                && !isService(_)
                && typeof _ === 'function'
            ) === -1
    }
    return false
}

export function isFragmentOfLayers(what) {
    return Array.isArray(what)
}

export function isLcConstructor(what) {
    return what[$isLc]
}

export function isService(what) {
    return !!what[$isService]
}

export function isInitializer(l) {
    return isFunction(l) && l.length === 1 // todo check that it only takes super (rather exactly 1 arg)
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

/* Instance related // todo move */

export function getDataFromPointer(compositionInstance) {
    return unwrapProxy(compositionInstance[$dataPointer])
}

export function selectExistingServices(composition) {
    /*
    * Do not change implementation, create new function
    * */
    return Object.fromEntries(
        Object.entries(composition).filter(_ => isService(_[1]))
    )
}

export function getLayerId(layer) {
    return layer[$layerId] || (layer[$layerId] = Symbol())
}

export function renameIntoGetter(functionName) {
    if (functionName.startsWith('get')) {
        let propName = functionName.replace('get', '')
        return propName
            && propName[0].toLowerCase() + propName.slice(1)
    }
}

export function renameIntoSetter(functionName) {
    if (functionName.startsWith('set')) {
        let propName = functionName.replace('set', '')
        return propName
            && propName[0].toLowerCase() + propName.slice(1)
    }
}

export function functionAsString(what) {
    return what.toString().replaceAll(/\s/g, '')
}
