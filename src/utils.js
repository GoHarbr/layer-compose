/* Object that who's keys are not all arrays or composed functions */
import {$composition, $compositionId, $dataPointer, $isCompositionInstance, $isLc, $isService, $layerId} from "./const"
import {unwrapProxy}                                                                                     from "./proxies/utils"

/* isType checks // todo move */

export function isServiceLayer(l) {
    if (!Array.isArray(l)) {
        const vals = Object.values(l)
        if (vals.length === 0) {
            return false
        }

        const propDescriptors = Object.getOwnPropertyDescriptors(l)
        const getters = Object.values(propDescriptors).filter(_ => !!_.get)
        if (getters.length > 0) {
            return false
        }

        /* every single value should be either an array, a constructor, marked as a service and not a function */
        const isSL = vals.every(isLensDefinition)
        if (isSL) {
            console.log(Object.keys(l))
            if (Object.keys(l).find(k => k[0] !== k[0].toUpperCase())) {
                throw new Error("Service names must start with a capital")
            }
        }
        return isSL
    }
    return false
}

export function isFragmentOfLayers(what) {
    return Array.isArray(what)
}

export function isLcConstructor(what) {
    return what[$isLc]
}

export function isLensDefinition(what) {
    return (typeof what !== 'function') && (Array.isArray(what)
    || isLcConstructor(what)
    || isService(what))
}

export function isService(what) {
    return !!what[$isService]
}

export function isInitializer(l) {
    return isFunction(l) && l.length >= 1 && l.length <= 2
    // todo check argument names
}

export function isConstructorLayer(what) {
    return isFunction(what) && what.length === 1
}

export function isFunction(what) {
    return (typeof what === 'function') // fixme, this will not always be correct
}

export function isPromise(what) {
    return what && typeof what == "object" && ("then" in what) && isFunction(what.then) && !what[$isCompositionInstance]
}

/* Constructor related */

export function getComposition(constructor) {
    const $ = $composition
    return constructor[$]
}

/* Instance related // todo move */

export function getDataFromPointer(compositionInstance) {
    return unwrapProxy(compositionInstance[$dataPointer])
}

export function unbox(compositionOrObject) {
    if (!compositionOrObject) return compositionOrObject
    if ($dataPointer in compositionOrObject) return getDataFromPointer(compositionOrObject)
    return unwrapProxy(compositionOrObject)
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
    return layer[$layerId] || layer[$compositionId] || layer[$composition]?.[$compositionId] || (layer[$layerId] = Symbol())
}

/* Function modification */

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

export function renameWithPrefix(prefix, name) {
    return `${prefix}${name[0].toUpperCase()}${name.slice(1)}`
}

export function functionAsString(what) {
    return what.toString().replaceAll(/\s/g, '')
}
