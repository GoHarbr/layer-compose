import layerCompose                                                                                   from "../index"
import {getLayerId, isFragmentOfLayers, isInitializer, isLcConstructor, isService, renameWithPrefix,}   from "../utils"
import {
    $composition,
    $dataPointer,
    $isSealed,
    $isService,
    $layers,
    $runOnInitialize,
    IS_DEV_MODE
} from "../const"
import {generateSuperAccessor}                                                                          from "../super/generateSuperAccessor"
import transformToStandardArgs
                                                                                                      from "./transformToStandardArgs"
import {functionComposer}                                                                             from "./functionComposer"
import {getDataProxy}                                                                                 from "../data/getDataProxy"

/*
* todo.
*  add import() ability from strings
* */

function processFragmentOfLayers(layerLike, composed) {
    for (let i = layerLike.length; i--; i >= 0) {
        const l = layerLike[i]
        composed = compose(l, composed)
        composed[$runOnInitialize] = [...composed[$runOnInitialize], ...(l[$runOnInitialize] || [])]
    }
    return composed
}

// noinspection FunctionWithMultipleLoopsJS,OverlyComplexFunctionJS,FunctionTooLongJS
function compose(layerLike, composed) {
    /* making sure that composeInto was created properly*/
    if (!composed[$runOnInitialize] || !Array.isArray(composed[$runOnInitialize])) throw new Error()

    const layerId = getLayerId(layerLike) // can also return compositionId

    if (composed[$layers].has(layerId)) {
        console.debug("Layer is already present in the composition", Object.keys(layerLike))
        return composed
    } else {
        composed[$layers].set(layerId, layerLike)
    }

    if (isLcConstructor(layerLike)) {

        const _l = layerLike[$composition][$layers].values()
        const layers = Array.from(_l)
        return processFragmentOfLayers(layers, composed)


    } else if (isInitializer(layerLike)) {
        /* todo. make sure that initializers don't depend on other services having been initialized */
        /* todo. make sure $ accessor can not be used once initialized */

        const $ = generateSuperAccessor(composed)

        const _ = (transformer) => {
            composed[$runOnInitialize].unshift(instance => {
                // fixme wrap the data into the proxy if DEV
                instance[$dataPointer] = transformer(instance[$dataPointer])
            })
        }

        // const fn = layerLike($, _) // adds items into initialization + other utilities
        layerLike($, _)

        // fn is to be ran on initialization
        // if (typeof fn == "function") composed[$runOnInitialize].push(fn)

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
                    // if this is a shape definition
                    // add getter
                    const getter = [renameWithPrefix('get', name), ($, _) => _[name]]
                    if (value === true) {
                        // add a setter as well
                        const setter = [renameWithPrefix('set', name), ($, _, opt) => {
                            _[name] = opt
                            return true
                        }]

                        return [getter, setter]
                    } else {
                        return [getter]
                    }
                } else if (typeof value === 'object' || isLcConstructor(value)) {

                    // if this is a service definition then it starts with a capital letter
                    if (name[0] !== name[0].toUpperCase()) {
                        throw new Error("Service names should start with uppercase: " + name)
                    }

                    let service
                    const serviceName = name[0] === "_" ? name : "_" + name

                    if (serviceName in composed) {
                        // todo. make sure getters and setters aren't overwriting services/lenses
                        if (isService(composed[serviceName])) {
                            service = layerCompose(value, composed[serviceName])
                        } else {
                            throw new Error('Service cannot be merged with a non-service on key: ' + name)
                        }
                    } else if (!isLcConstructor(value)) {
                        service = layerCompose(value)
                    } else {
                        service = value
                    }
                    service[$isService] = true

                    return [[serviceName, service]]
                } else if (typeof value == 'function') {
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
                            // composedFunction = functionComposer(existing, fn)
                            composedEntry = functionComposer(existing, wrapForDev(layerId, fn))
                        } else {
                            composedEntry = functionComposer(existing, fn)
                        }
                    } else {
                        composedEntry = fn
                        // todo, this is not always reliable
                        // composedEntry.isAsync = fn[Symbol.toStringTag] === 'AsyncFunction'

                        if (IS_DEV_MODE && Object.isExtensible(composedEntry)) {
                            composedEntry = wrapForDev(layerId, composedEntry)
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
        // todo. wrap opt in proxy as well
        return fn($, __, opt)
    }
    wrapped.isAsync = fn.isAsync
    return wrapped
}

export default compose
