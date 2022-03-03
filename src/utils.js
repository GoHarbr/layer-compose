/* Object that who's keys are not all arrays or composed functions */
import { $composition, $compositionId, $dataPointer, $isCompositionInstance, $isLc, $layerId } from "./const"
import { unwrapProxy } from "./proxies/utils"

/* isType checks // todo move */

export function isFragmentOfLayers(what) {
    return Array.isArray(what)
}

export function isLcConstructor(what) {
    return what[$isLc]
}


export function isFunction(what) {
    return (typeof what === 'function') // fixme, this will not always be correct
}

export function isPromise(what) {
    return what && typeof what == "object" && ("then" in what) && isFunction(what.then) && !what[$isCompositionInstance]
}

export function isAwaitable(what) {
    return what && typeof what == "object" && (what[$isCompositionInstance] || (("then" in what) && isFunction(what.then)))
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

let layerIdString = 1
export function getLayerId(layer, {noSet} = {}) {
    const existing = layer[$layerId] || layer[$compositionId] || layer[$composition]?.[$compositionId]
    if (!existing && noSet) throw new Error("No layer id")
    return existing || (layer[$layerId] = layerIdString++)
}

/* Function modification */

export function renameIntoGetter(functionName) {
    if (functionName.startsWith('get')) {
        let propName = functionName.replace('get', '')
        return propName
            && propName[0].toLowerCase() + propName.slice(1)
    }
}

export function functionAsString(what) {
    return what.toString().replaceAll(/\s/g, '')
}
