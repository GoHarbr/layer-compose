import layerCompose                  from "./index"
import {isServiceLayer, mustBeBuilt} from "./utils"

export function compose(layer, composeInto = {}) {
    if (mustBeBuilt(layer)) {
        const built = layer({$: composeInto, b: {/* implement borrow */}})
        compose(built, composeInto)
    } else if (isServiceLayer(layer)) {
        const services = layer
        for (const name of Object.keys(services)) {
            if (Array.isArray(services[name])) {
                services[name] = layerCompose(...services[name])
            }
            services[name] = services[name].asService() // transforms into a obj with methods
        }
        Object.assign(composeInto, services)
    } else {
        const next = Object.fromEntries(
            Object.entries(layer).map(([name, func]) => { // fixme. func could be a LC
                let composedFunction

                const existing = composeInto[name]
                if (existing) {
                    composedFunction = function (data, opt) {
                        const re = existing(data, opt)
                        const rt = func(data, opt) // todo find out how much of a performance draw this is
                        if (re && rt) {
                            return {...re, ...rt}
                        } else if (re) {
                            return re
                        } else {
                            return rt
                        }
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
