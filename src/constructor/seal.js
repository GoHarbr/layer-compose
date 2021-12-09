import {isPromise, isService, renameIntoSetter} from "../utils"
import {
    $compositionId,
    $dataPointer,
    $initializer,
    $isSealed,
    $parentInstance,
    $lensName,
    $services,
    $writableKeys,
    IS_DEV_MODE, $isCompositionInstance
} from "../const"
import buildInitializer                         from "./buildInitializer"
import {unwrapProxy}                            from "../proxies/utils"
import {wrapCompositionWithProxy}               from "../proxies/wrapCompositionWithProxy"
import {queueForExecution}                      from "../compose/queueForExecution"

let _compositionId = 0 // for debug purposes

// noinspection FunctionTooLongJS
export default function seal(composed) {
    _compositionId++
    composed[$compositionId] = composed[$compositionId] || Symbol(_compositionId + '::composition-id')

    for (const name in composed) {
        const methodOrService = composed[name]
        if (typeof name == "symbol") continue


        if (isService(methodOrService)) {
            const lensName = name.slice(1) // services are stored with _ prefix inside compositions


            // composed[lensName] = (cbOrCore, cb) => queueForExecution(this, makeLens)
            composed[lensName] = makeLens

            function makeLens (cbOrCore, cb) {
                let lensCore = null
                let cbWithService

                if (typeof cbOrCore === 'object') {
                    lensCore = cbOrCore
                    cbWithService = cb
                } else {
                    cbWithService = cbOrCore
                }

                if (!cbWithService) throw new Error("Callback must be present to access the service")

                const serviceContainer = composed[name]

                // first try searching for service name (which starts with a capital) in parent's core,
                // or give the parent's core
                // const serviceCore = lensName in this[$dataPointer] ?
                //     this[$dataPointer][lensName]
                //     : null

                const parent = IS_DEV_MODE ? wrapCompositionWithProxy(this) : this

                const initializer = instance => {
                    instance[$lensName] = lensName // todo. This functionality should live in `compose.js`
                    instance[$parentInstance] = parent
                }

                // now going to deal with sync/async cases
                if (!serviceContainer.isComplete && serviceContainer.completePromise) {
                    queueForExecution(parent,
                        () => serviceContainer.completePromise,
                        () => {
                            serviceContainer.isComplete = true
                            const s = serviceContainer.composition(lensCore, { initializer })
                            queueForExecution(parent, () => cbWithService(s))
                        })
                } else {
                    queueForExecution(parent, () => {
                        const s = serviceContainer.composition(lensCore, { initializer })
                        queueForExecution(parent, () => cbWithService(s))
                    })
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
