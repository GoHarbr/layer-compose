import {$objectId, $dataPointer, $setData, IS_DEV_MODE} from "../const"
import {attachDataUnderneath}                           from "./attachDataUnderneath"
import {isService}                           from "../utils"

export function createInstance(composedLayers) {
    const compositionInstance = {
        [$dataPointer]: undefined, // this is filled with actual data during instantiation
        [$setData]: function setData(d, {isOriginalCall = true} = {}) {
            if (d === undefined) {
                d = {}
            }
            if (typeof d !== 'object') {
                throw new Error('Data must be an object')
            }
            // if (!d[$objectId]) d[$objectId] = Symbol()
            compositionInstance[$dataPointer] = d

            /*
            * Layering the actual data underneath
            * */
            if (isOriginalCall) attachDataUnderneath(d, compositionInstance)

            for (const name of serviceNames) {
                compositionInstance[name][$setData](d, {isOriginalCall: false})
            }
        }
    }

    const serviceNames = []

    for (const name of Object.keys(composedLayers)) {
        let methodOrService = composedLayers[name]

        if (isService(methodOrService)) {
            compositionInstance[name] = methodOrService
            serviceNames.push(name)
        } else {
            const defaultOpt = {} // todo. check if defaults injected into here during initialization
            compositionInstance[name] = (opt) => {
                if (IS_DEV_MODE && !!opt && typeof opt != 'object') {
                    throw new Error("Layer methods can take only named parameters")
                }
                methodOrService(compositionInstance[$dataPointer], opt || defaultOpt)
            }
        }
    }

    return {compositionInstance, serviceNames}
}
