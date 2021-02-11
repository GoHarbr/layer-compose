import layerCompose            from "../index"
import {
    getLayerId,
    isFragmentOfLayers,
    isInitializer,
    isLcConstructor,
    isServiceLayer,
}                              from "../utils"
import {
    $composition, $functionSymbolIds,
    $initializer,
    $isService,
    $runOnInitialize,
    IS_DEV_MODE
} from "../const"
import {generateSuperAccessor} from "../super/generateSuperAccessor"
import transformToStandardArgs from "./transformToStandardArgs"
import {functionComposer}      from "./functionComposer"
import {getDataProxy}          from "../data/getDataProxy"

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
        next[$runOnInitialize] = [/* could run extend super here? */composition[$initializer]]
        /* or maybe add it here for the next layer to access and then delete */
        function composeFn(fnName) {
            if (fnName in next) {
                next[fnName] = functionComposer(next[fnName], composition[fnName])
            } else {
                next[fnName] = composition[fnName]
            }
        }

        for (const fnName in composition) {
            composeFn(fnName)
        }
        for (const fnSymbolName of composition[$functionSymbolIds]) {
            composeFn(fnSymbolName)
        }

        return next

    } else if (isInitializer(layerLike)) {
        /* todo. make sure that initializers don't depend on other services having been initialized */

        const $ = generateSuperAccessor(composed)
        layerLike($) // adds items into initialization + other utilities

        return composed

    } else if (isServiceLayer(layerLike)) {
        const services = layerLike

        const serviceNames = Object.keys(services)
        const conflictingName = serviceNames.find(_ => _ in composed)
        if (conflictingName) {
            throw new Error('Service is already defined: ' + conflictingName)
        }

        for (const name of serviceNames) {
            if (!isLcConstructor(services[name])) {
                services[name] = layerCompose(services[name])
            }
            services[name][$isService] = true
        }

        return Object.assign(composed, services)

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

        const next = Object.fromEntries(
            Object.entries(layerLike).map(([name, fn]) => {
                // if (!Object.isExtensible(func)) return

                let composedFunction

                fn = transformToStandardArgs(fn)

                /*
                * Functions with names starting with get are copied, renamed and become actual getters
                * Getters are overriden by each other, unlike regular layer methods that are composed
                **/

                // const isGetter = !!renameIntoGetter(name)
                const existing = composed[name]
                if (existing /*&& !isGetter*/) {
                    if (IS_DEV_MODE) {
                        // composedFunction = functionComposer(existing, fn)
                        composedFunction = functionComposer(existing, wrapForDev(layerId, fn))
                    } else {
                        composedFunction = functionComposer(existing, fn)
                    }
                } else {
                    composedFunction = fn
                    composedFunction.isAsync = fn[Symbol.toStringTag] === 'AsyncFunction'

                    if (IS_DEV_MODE) {
                        composedFunction = wrapForDev(layerId, composedFunction)
                    }
                }

                return [name, composedFunction]
            }).filter(m => !!m)
        )

        return Object.assign(Object.create(composed), next)
    }
}

function wrapForDev(layerId, fn) {
    const wrapped = function ($, _, opt) {
        const __ = getDataProxy(layerId, _)
        return fn($, __, opt)
    }
    wrapped.isAsync = fn.isAsync
    return wrapped
}

export default compose
