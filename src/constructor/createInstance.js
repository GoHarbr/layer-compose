import {$dataPointer, $initializer, $runOnInitialize, $setData, IS_DEV_MODE} from "../const"
import {isPromise, isService, renameIntoGetter}                              from "../utils"
import buildInitializer                                                      from "./buildInitializer"

export function createInstance(composedLayers) {
    let ownScope
    let lastSetDataExecutionId
    const serviceNames = []

    const compositionInstance = {
        [$dataPointer]: undefined, // this is filled with actual data during instantiation
        [$runOnInitialize]: composedLayers[$runOnInitialize],
        [$setData]: function setData(d, {
            isOriginalCall = true, selfOnly = false,
            createOwnScope = false,
            executionId = Symbol()
        } = {}) {

            if (lastSetDataExecutionId === executionId) return
            // eg. service calls a service from parent
            // preventing circular references

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

            if (!selfOnly) {
                for (const name of serviceNames) {
                    compositionInstance[name][$setData](ownScope || d, {
                        isOriginalCall: false,
                        createOwnScope: true,
                        executionId
                    })
                }
            }

            lastSetDataExecutionId = executionId
        }
    }

    for (const name of Object.keys(composedLayers)) {
        let methodOrService = composedLayers[name]

        if (isService(methodOrService)) {
            compositionInstance[name] = methodOrService
            serviceNames.push(name)
        } else {
            const defaultOpt = {} // todo. check if defaults injected into here during initialization (if yes probably fix?)

            const getterName = renameIntoGetter(name)
            const isGetter = !!getterName

            compositionInstance[name] = (opt) => {
                // todo. this does not provide protection for calling methods internally
                //        maybe allow to pass in primitives if the `_` is used instead of opt
                if (IS_DEV_MODE && !!opt && typeof opt != 'object') {
                    throw new Error("Layer methods can take only named parameters")
                }
                const r = methodOrService(compositionInstance[$dataPointer], opt || defaultOpt)
                if (IS_DEV_MODE && isPromise(r)) {
                    return r.catch(e => {
                        console.error('Promise rejected:', e)
                        throw e
                    })
                } else {
                    return r
                }
            }

            /* todo make sure getters can't have `opt`
            * although it would be kind of cool to have both a default getter and a function with opt
            * */

            if (isGetter) {
                Object.defineProperty(compositionInstance, getterName, {get: compositionInstance[name]})
            }

            /* todo. idea: if the final return value only has one key, extract it */
        }
    }

    compositionInstance[$initializer] = buildInitializer(compositionInstance, serviceNames)

    return {compositionInstance, serviceNames}
}
