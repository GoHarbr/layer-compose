import layerCompose      from "./index"
import {
    selectExistingServices,
    isFragmentOfLayers,
    isLayerBuilder,
    isLcConstructor,
    isServiceLayer,
    getLayerId,
    isFunction, isService
}                                                       from "./utils"
import {IS_DEV_MODE, $layerId, $runOnInitialize, $spec} from "./const"
import {generateDataAccessor}   from "./generateDataAccessor"
import {generateSuperAccessor}  from "./super/generateSuperAccessor"
import {layerMethodFormatCheck} from "./dev-checks"
import {wrapDataWithProxy}      from "./proxies/proxies"

export function compose(layerLike, composeInto) {
    if (!composeInto[$runOnInitialize]) throw new Error()

    if (isLayerBuilder(layerLike)) {
        const layerId = getLayerId(layerLike)
        const accessors = {
            d: generateDataAccessor(layerId),
            $: generateSuperAccessor(composeInto)
        }

        // todo, provide strictly necessary (amount) of args by reading from
        // function.toString()
        const built = layerLike(accessors.$.constructor, accessors.d.constructor)

        composeInto[$runOnInitialize].push(accessors.d.initializer)
        composeInto[$runOnInitialize].push(accessors.$.initializer)


        if (isFunction(built) && built.length === 0) {
            // initializer

            /*
            * Things possible in a constructor function
            * - running service methods
            * - setting defaults, but not allowing write access to any layer
            * */

            composeInto[$runOnInitialize].push(built)
        } else if (typeof built === "object") {
            built[$layerId] = layerId // for controlling access
            compose(built, composeInto)
        }

    } else if (isServiceLayer(layerLike)) {
        const services = layerLike
        const existingServices = selectExistingServices(composeInto)

        const serviceNames = Object.keys(services)
        for (const name of serviceNames) {
            if (Array.isArray(services[name])) {
                services[name] = layerCompose.withServices(services[name])(existingServices)
                /*
                * This means that only fragments can receive instantiated services
                * anything that ran through `layerCompose` would already fail because the services would not be found
                * */
            }
            if (!isService(services[name])) {
                services[name] = services[name].asService() // transforms into a obj with methods
            }
        }

        const existingServiceNames = Object.keys(existingServices)
        const conflictingName = serviceNames.find(_ => existingServiceNames.includes(_))
        if (conflictingName) {
            throw new Error('Service is already defined: ' + conflictingName)
        }

        Object.assign(composeInto, services)

    } else if (isFragmentOfLayers(layerLike)) {
        if (isLcConstructor(layerLike)) {
            layerLike = layerLike[$spec]
        }
        /*
        * The style of spec definition is
        * bottom layers (base mixins; called first) are defined after top layers (extending mixins; called last)
        * */
        for (const l of layerLike.reverse()) {
            compose(l, composeInto)
        }
    } else {
        const layerId = getLayerId(layerLike)

        const next = Object.fromEntries(
            Object.entries(layerLike).map(([name, func]) => {
                // fixme. check that func is not layerCompose constructor
                layerMethodFormatCheck(func)
                let composedFunction

                const existing = composeInto[name]
                if (existing) {

                    if (IS_DEV_MODE) {
                        const _f = function (data, opt) {
                            data = wrapDataWithProxy(layerId, data, {}, {isGetOnly: false})
                            return func(data, opt)
                        }

                        composedFunction = functionComposer(existing, _f)
                    } else {
                        composedFunction = functionComposer(existing, func)
                    }
                } else {
                    composedFunction = func

                    if (IS_DEV_MODE) {
                        composedFunction = function (data, opt) {
                            data = wrapDataWithProxy(layerId, data, {}, {isGetOnly: false})
                            return func(data, opt)
                        }
                    }
                }

                return [name, composedFunction]
            })
        )

        Object.assign(composeInto, next)
    }
}

function functionComposer(existing, func) {
    return function (data, opt) {
        let re = existing(data, opt)

        const thisLayerResult = func(data, opt)

        // todo find out how much of a performance drawdown for combining results
        if (re && thisLayerResult) {
            return {...re, ...thisLayerResult}
        } else if (re) {
            return re
        } else {
            return thisLayerResult
        }

        if (!re && thisLayerResult) {
            re = {}
        } else if (typeof thisLayerResult !== 'object') { // re has been already checked
            throw new Error('returned value must be undefined or an object')
        }

        /* todo. add a dev check that properties aren't overwriting each other */

        if (thisLayerResult) {
            Object.assign(re, thisLayerResult)
        }
        return re
    }
}
