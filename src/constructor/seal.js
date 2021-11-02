import {isPromise, isService, renameIntoSetter} from "../utils"
import {
    $compositionId,
    $dataPointer,
    $initializer,
    $isSealed,
    $parentComposition,
    $serviceName,
    $services,
    $writableKeys,
    IS_DEV_MODE
}                                 from "../const"
import buildInitializer           from "./buildInitializer"
import {unwrapProxy}              from "../proxies/utils"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import {queueForExecution}        from "../compose/queueForExecution"

let _compositionId = 0 // for debug purposes

// noinspection FunctionTooLongJS
export default function seal (composed) {
    _compositionId++
    composed[$compositionId] = composed[$compositionId] || Symbol(_compositionId + '::composition-id')

    for (const name in composed) {
        const methodOrService = composed[name]
        if (typeof name == "symbol") continue


        if (isService(methodOrService)) {
            const serviceName = name.slice(1) // services are stored with _ prefix inside compositions
            const serviceContainer = methodOrService

            // const storeUnder = service[$composition][$compositionId]
            const storeUnder = serviceName
            composed[serviceName] = function (cbWithService) {
                if (!cbWithService) throw new Error("Callback must be present to access the service")

                let s = this[$services][storeUnder] // no need to re-initialize if there's an alive instance
                if (!s) {
                    // attaching service name // needs to be done bofere all other initializers, eg. for detaching self
                    let parent = this
                    if (IS_DEV_MODE) {
                        parent = wrapCompositionWithProxy(this)
                    }
                    const initializer = instance => {
                        instance[$parentComposition] = parent
                        parent[$services][storeUnder] = instance // storing for reuse
                        instance[$serviceName] = storeUnder
                    }

                    // first try searching for service name (which starts with a capital) in parent's core,
                    // or give the parent's core
                    const serviceCore = serviceName in this[$dataPointer] ?
                        this[$dataPointer][serviceName]
                        : null

                    // now going to deal with sync/async cases
                    if (serviceContainer.completePromise) {
                        queueForExecution(parent,
                            () => serviceContainer.completePromise,
                            () => {
                                cbWithService(
                                    serviceContainer.composition(serviceCore, { initializer })
                                )
                            })
                    } else {
                        const s = serviceContainer.composition(serviceCore, { initializer })
                        cbWithService(s)
                    }
                } else {
                    // todo. should this call be queued on the parent??? why not use `await`
                    cbWithService(s)
                }
            }
        } else {

            /*
            * if this function belongs to another sealed composition, don't wrap around it
            * */
            if (Object.isExtensible(methodOrService)) {

                let method = methodOrService

                if (IS_DEV_MODE) {
                    composed[name] = function (opt, ...rest) {
                        if (!!opt && (Array.isArray(opt) || rest.length)) {
                            throw new Error("Layer methods can take only named parameters/options or a single argument")
                        }

                        const _ = unwrapProxy(this[$dataPointer]) // todo. is this necessary
                        // const r = method(this[compositionId], _, opt || {})
                        const r = method(this, _, optOrEmpty(opt))
                        // method.compressionMethod)

                        if (isPromise(r) && method.isAsync) {
                            return r.catch(e => {
                                console.error('Promise rejected:', e)
                                throw e
                            })
                        } else {
                            return r
                        }
                    }
                } else {
                    composed[name] = function (opt) {
                        return method(this, this[$dataPointer], optOrEmpty(opt))
                        // return method(this[compositionId], this[$dataPointer], opt || {})
                        // method.compressionMethod)
                    }
                }

                /* Sealing the function */

                composed[name].isSealed = true // todo. remove
                composed[name][$isSealed] = true
                // composed[name].isAsync = method.isAsync
                Object.freeze(composed[name])
            }

            // const getterName = renameIntoGetter(name)
            const setterName = renameIntoSetter(name)

            if (setterName) {
                composed[$writableKeys].push(setterName)
                Object.defineProperty(composed, setterName, { set: composed[name], configurable: true })
            }

        }
    }

    composed[$initializer] = buildInitializer(composed)

    return composed
}

function optOrEmpty(what) {
    return what == null ? {} : what
}
