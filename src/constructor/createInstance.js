import {$objectId, $dataPointer, $setData, IS_DEV_MODE} from "../const"
import {attachDataUnderneath}                           from "./attachDataUnderneath"
import {isService}                           from "../utils"

export function createInstance(composedLayers) {
    let ownScope
    let lastSetDataExecutionId

    const compositionInstance = {
        [$dataPointer]: undefined, // this is filled with actual data during instantiation
        [$setData]: function setData(d, {isOriginalCall = true, selfOnly = false,
            createOwnScope = false, executionId = Symbol()} = {}) {

            if (lastSetDataExecutionId === executionId) return // eg. service calls a service from parent

            if (d == null) {
                d = {}
            }
            if (typeof d !== 'object') {
                throw new Error('Data must be an object')
            }

            if (createOwnScope) {
                if (!ownScope) {
                    ownScope = Object.create(d)
                } else {
                    throw new Error('Setting data on a service more than once is not supported yet')
                }
            }

            compositionInstance[$dataPointer] = ownScope || d

            /*
            * Layering the actual data underneath
            * */
            if (isOriginalCall) {
                // fixme this will not layer properly with own scope
                attachDataUnderneath(ownScope || d, compositionInstance)
            }

            if (!selfOnly) {
                for (const name of serviceNames) {
                    compositionInstance[name][$setData](ownScope || d, {isOriginalCall: false, createOwnScope: true, executionId})
                }
            }

            lastSetDataExecutionId = executionId
        }
    }

    const serviceNames = []

    for (const name of Object.keys(composedLayers)) {
        let methodOrService = composedLayers[name]

        if (isService(methodOrService)) {
            compositionInstance[name] = methodOrService
            serviceNames.push(name)
        } else {
            const defaultOpt = {} // todo. check if defaults injected into here during initialization (if yes probably fix?)
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
