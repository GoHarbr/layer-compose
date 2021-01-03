import layerCompose                                                       from "./index"
import {isFragmentOfLayers, isLcConstructor, isServiceLayer, mustBeBuilt} from "./utils"
import {$onInitialize, $spec, IS_DEV_MODE}                                from "./const"
import {generateDataAccessor}                                             from "./generateDataAccessor"
import wrapWithProxy                 from "./wrapWithProxy"

function generateSuperAccessor(composedUpTo) {
    if (IS_DEV_MODE) {
        // fixme. use own proxy to prevent sets / throw on gets
        return wrapWithProxy(composedUpTo, {/* empty borrow, thus no setting */}, {isGetOnly: false})
    } else {
        return composedUpTo
    }
}

export function compose(layerLike, composeInto) {
    if (!composeInto[$onInitialize]) throw new Error()

    if (mustBeBuilt(layerLike)) {
        const accessors = {
            d: generateDataAccessor(),
            $: generateSuperAccessor(composeInto)
        }
        const built = layerLike({$: accessors.$, d: accessors.d.constructor})
        composeInto[$onInitialize].push(accessors.d.initializer)
        compose(built, composeInto)
    } else if (isServiceLayer(layerLike)) {
        const services = layerLike
        for (const name of Object.keys(services)) {
            if (Array.isArray(services[name])) {
                services[name] = layerCompose(...services[name])
            }
            services[name] = services[name].asService() // transforms into a obj with methods
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
        const next = Object.fromEntries(
            Object.entries(layerLike).map(([name, func]) => { // fixme. func could be a LC
                let composedFunction

                const existing = composeInto[name]
                if (existing) {
                    composedFunction = function (data, opt) {
                        let re = existing(data, opt)
                        const rt = func(data, opt)

                        // todo find out how much of a performance draw for combining results
                        if (re && rt) {
                            return {...re, ...rt}
                        } else if (re) {
                            return re
                        } else {
                            return rt
                        }

                        if (!re && rt) {
                           re = {}
                        } else if (typeof rt !== 'object') { // re has been already checked
                            throw new Error('returned value must be undefined or an object')
                        }

                        if (rt) {
                            Object.assign(re, rt)
                        }
                        return re
                    }
                } else {
                    composedFunction = func
                }

                return [name, composedFunction]
            })
        )

        Object.assign(composeInto, next)
    }
}
