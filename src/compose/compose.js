import layerCompose                                                                                   from "../index"
import {getLayerId, isFragmentOfLayers, isInitializer, isLcConstructor, isService, renameWithPrefix,} from "../utils"
import {$composition, $initializer, $isService, $runOnInitialize, IS_DEV_MODE}                        from "../const"
import {generateSuperAccessor}                                                                        from "../super/generateSuperAccessor"
import transformToStandardArgs
                                                                                                      from "./transformToStandardArgs"
import {functionComposer}                                                                             from "./functionComposer"
import {getDataProxy}                                                                                 from "../data/getDataProxy"

/*
* todo.
*  add import() ability from strings
* */

// noinspection FunctionWithMultipleLoopsJS,OverlyComplexFunctionJS,FunctionTooLongJS
function compose(layerLike, composed) {
    /* making sure that composeInto was created properly*/
    if (!composed[$runOnInitialize] || !Array.isArray(composed[$runOnInitialize])) throw new Error()

    if (isLcConstructor(layerLike)) {

        const composition = layerLike[$composition]
        const next = Object.create(composed)
        next[$runOnInitialize].push(composition[$initializer])

        function composeFn(fnName) {
            if (fnName in next) {
                // todo. check that this is a function (and not a service)
                if (typeof next[fnName] != "function" || typeof composition[fnName] != "function") {
                    throw new Error('Cannot combine a non-function property and a function')
                }
                next[fnName] = functionComposer(next[fnName], composition[fnName])
            } else {
                next[fnName] = composition[fnName]
            }
        }

        for (const fnName in composition) {
            composeFn(fnName)
        }
        // for (const fnSymbolName of composition[$functionSymbolIds]) {
        //     composeFn(fnSymbolName)
        // }

        return next

    } else if (isInitializer(layerLike)) {
        /* todo. make sure that initializers don't depend on other services having been initialized */
        /* todo. make sure $ accessor can not be used once initialized */

        const $ = generateSuperAccessor(composed)
        const fn = layerLike($) // adds items into initialization + other utilities

        // fn is to be ran on initialization
        if (fn) composed[$runOnInitialize].push(fn)

        return composed

    } else if (isFragmentOfLayers(layerLike)) {
        /*
        * The style of spec definition is
        * bottom layers (base mixins; called first) are defined after top layers (extending mixins; called last)
        * */
        for (let i = layerLike.length; i--; i >= 0) {
            const l = layerLike[i]
            composed = compose(l, composed)
        }
        return composed
    } else {
        const layerId = getLayerId(layerLike)

        // todo. make sure getters and setters aren't overwriting services

        const next = Object.fromEntries(
            Object.entries(layerLike).map(([name, value]) => {

                // todo. what if not a function, but a primitive?

                // const ld = isLensDefinition(value)
                // const sd = isServiceLayer(value)
                // if (ld || sd) {

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

                    // if this is a service definition
                    if (name[0] !== name[0].toUpperCase()) {
                        throw new Error("Service names should start with uppercase: " + name)
                    }

                    let service
                    if (name in composed) {
                        // todo. make sure getters and setters aren't overwriting services/lenses
                        if (isService(composed[name])) {
                            service = layerCompose(value, composed[name])
                        } else {
                            throw new Error('Service cannot be merged with a non-service on key: ' + name)
                        }
                    } else if (!isLcConstructor(value)) {
                        service = layerCompose(value)
                    } else {
                        service = value
                    }
                    service[$isService] = true

                    return [[name, service]]
                } else if (typeof value == 'function') {
                    // if this is a function definition, compose

                    let composedEntry
                    const fn = transformToStandardArgs(value)

                    /*
                    * Functions with names starting with get are copied, renamed and become actual getters
                    * Getters are overriden by each other, unlike regular layer methods that are composed
                    **/

                    // const isGetter = !!renameIntoGetter(name)
                    const existing = composed[name]
                    if (existing /*&& !isGetter*/) {
                        if (IS_DEV_MODE) {
                            // composedFunction = functionComposer(existing, fn)
                            composedEntry = functionComposer(existing, wrapForDev(layerId, fn))
                        } else {
                            composedEntry = functionComposer(existing, fn)
                        }
                    } else {
                        composedEntry = fn
                        // todo, this is not always reliable
                        composedEntry.isAsync = fn[Symbol.toStringTag] === 'AsyncFunction'

                        if (IS_DEV_MODE) {
                            composedEntry = wrapForDev(layerId, composedEntry)
                        }
                    }

                    return [[name, composedEntry]]
                } else {
                    throw new Error('Only functions, services, and shape definitions (booleans) are allowed')
                }

            }).flat().filter(m => !!m)
        )

        return Object.assign(Object.create(composed), next)
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
