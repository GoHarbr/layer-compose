import layerCompose                                                                                   from "../layerCompose"
import {getLayerId, isFragmentOfLayers, isInitializer, isLcConstructor, isService, renameWithPrefix,}   from "../utils"
import {
    $composition,
    $dataPointer,
    $isSealed,
    $isService, $layerOrder,
    $layers,
    $runOnInitialize,
    IS_DEV_MODE
}                                 from "../const"
import {generateSuperAccessor}    from "../super/generateSuperAccessor"
import transformToStandardArgs
                                  from "./transformToStandardArgs"
import {functionComposer}         from "./functionComposer"
import {getDataProxy}             from "../data/getDataProxy"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import {queueForExecution}        from "./queueForExecution"

/*
* todo.
*  add import() ability from strings
* */

function processFragmentOfLayers(layerLike, composed, inGivenOrder = false) {
    if (inGivenOrder) {
        layerLike.reverse()
    }

    for (let i = layerLike.length; i--; i >= 0) {
        const l = layerLike[i]
        composed = compose(l, composed)
        composed[$runOnInitialize] = [...(l[$runOnInitialize] || []), ...composed[$runOnInitialize]]
    }
    return composed
}

// noinspection FunctionWithMultipleLoopsJS,OverlyComplexFunctionJS,FunctionTooLongJS
function compose(layerLike, composed) {
    /* making sure that composeInto was created properly*/
    if (!composed[$runOnInitialize] || !Array.isArray(composed[$runOnInitialize])) throw new Error()

    const layerId = getLayerId(layerLike) // can also return compositionId

    if (composed[$layers].has(layerId)) {
        // console.debug("Layer is already present in the composition", Object.keys(layerLike))
        return composed
    } else {
        composed[$layers].set(layerId, layerLike)
        composed[$layerOrder].push(layerId)
    }

    if (isLcConstructor(layerLike)) {

        const layerDirectory = layerLike[$composition][$layers]
        const layers = layerLike[$composition][$layerOrder].map(lId => layerDirectory.get(lId))

        if (IS_DEV_MODE && layers.some(_ => !_)) {
            throw new Error("A layer was not found") // temporary sanity check
        }

        return processFragmentOfLayers(layers, composed, /* in given order */ true)


    } else if (isInitializer(layerLike)) {
        /* todo. make sure that initializers don't depend on other services having been initialized */

            composed[$runOnInitialize].unshift(instance => {
                const _ = instance[$dataPointer]
                queueForExecution(instance, () => layerLike(instance, _))

                // todo. add Dev check that the function is not async and calls async methods on the composition instance
                // todo. add DEV checks that the same method isn't called during initialization twice.
            })

        return composed

    } else if (isFragmentOfLayers(layerLike)) {
        /*
        * The style of spec definition is
        * bottom layers (base mixins; called first) are defined after top layers (extending mixins; called last)
        * */
        return processFragmentOfLayers(layerLike, composed)
    } else {

        // todo. make sure getters and setters aren't overwriting services

        const next = Object.fromEntries(
            Object.entries(layerLike).map(([name, value]) => {

                // todo. what if not a function, but a primitive?

                if (typeof value === 'boolean') {
                    if (value === true) {
                        // add a setter as well
                        const setter = [renameWithPrefix('set', name), ($, _, opt) => {
                            _[name] = opt
                            return true
                        }]

                        return [setter]
                    } else {
                        return []
                    }

                } else if (typeof value === 'object' || isLcConstructor(value)) {
                    // if this is a service definition then it starts with a capital letter
                    if (name[0] !== name[0].toUpperCase()) {
                        throw new Error("Service names should start with uppercase: " + name)
                    }

                    let serviceContainer
                    const serviceName = name[0] === "_" ? name : "_" + name

                    if (serviceName in composed) {
                        // todo. make sure getters and setters aren't overwriting services/lenses
                        if (isService(composed[serviceName])) {
                            // service might be an import
                            serviceContainer = composed[serviceName]
                            // result of the import, if there is an async import in the chain
                            const completePromise = serviceContainer.completePromise ||
                                (typeof value.then === 'function' && Promise.resolve())

                            if (completePromise) {
                                // chaining together all the async calls
                                serviceContainer.completePromise =
                                    completePromise.then(() => value).then(importRes => {
                                        const isModule = importRes.__esModule
                                        if (isModule && !importRes.default) throw new Error('Composition must be a default export')

                                        const c =  importRes.__esModule ? importRes.default : importRes
                                        serviceContainer.composition = layerCompose(c, serviceContainer.composition)
                                })
                                // todo. remove
                                // serviceContainer.completePromise.layers = [...(completePromise.layers || []), value]
                            } else {
                                // nothing async yet
                                serviceContainer.composition = layerCompose(value, serviceContainer.composition)
                            }
                        } else {
                            throw new Error('Service cannot be merged with a non-service on key: ' + name)
                        }
                    } else {
                        // service might be an import
                        const isAsyncCompiler = typeof value.then === 'function'
                        serviceContainer = {
                            [$isService] : true,
                            completePromise: isAsyncCompiler ? value : null
                        }

                        // async case
                        if (isAsyncCompiler) {
                            serviceContainer.completePromise.then(importRes => {
                                const isModule = importRes.__esModule
                                if (isModule && !importRes.default) throw new Error('Composition must be a default export')

                                const c =  importRes.__esModule ? importRes.default : importRes

                                if (!isLcConstructor(c)) {
                                    serviceContainer.composition = layerCompose()
                                } else {
                                    serviceContainer.composition = c
                                }
                            })

                        } else {
                            // sync case
                            // fixme. factor this code out
                            if (!isLcConstructor(value)) { // service could be a plain, non-compiled object
                                serviceContainer.composition = layerCompose(value)
                            } else {
                                serviceContainer.composition = value
                            }
                        }

                    }

                    return [[serviceName, serviceContainer]]
                } else if (typeof value == 'function') {

                    // reversing in case of the foreground initializer function
                    const fnC = name === '_' ? (existing, next) => functionComposer(next, existing) : functionComposer

                    // if this is a function definition, compose
                    let composedEntry
                    const fn = value[$isSealed] ? value : transformToStandardArgs(value)

                    /*
                    * Functions with names starting with get are copied, renamed and become actual getters
                    * Getters are overriden by each other, unlike regular layer methods that are composed
                    **/

                    // const isGetter = !!renameIntoGetter(name)
                    const existing = composed[name]
                    if (existing /*&& !isGetter*/) {
                        if (IS_DEV_MODE && !fn[$isSealed]) {
                            composedEntry = fnC(existing, wrapForDev(layerId, fn))
                        } else {
                            composedEntry = fnC(existing, fn)
                        }
                    } else {
                        // todo, this is not always reliable

                        if (IS_DEV_MODE && Object.isExtensible(fn)) {
                            composedEntry = fnC(null, wrapForDev(layerId, fn))
                        } else {
                            composedEntry = fnC(null, fn)
                        }
                    }

                    return [[name, composedEntry]]
                } else {
                    throw new Error('Only functions, services, and shape definitions (booleans) are allowed')
                }

            }).flat().filter(m => !!m)
        )

        // return Object.assign(Object.create(composed), next)
        return Object.assign(composed, next)
    }
}

function wrapForDev(layerId, fn) {
    const wrapped = function ($, _, opt) {
        const __ = getDataProxy(layerId, _)
        const $$ = wrapCompositionWithProxy($)
        // const _opt = wrapCompositionWithProxy(opt)

        // todo. wrap opt in proxy as well
        // return fn($$, __, _opt)
        return fn($$, __, opt)
    }
    wrapped.isAsync = fn.isAsync
    return wrapped
}

export default compose
