const lcSymbol = Symbol();
const isDevMode = process.env.NODE_ENV !== 'production'

export default function layerCompose(...layers) {
    const executeOnInitialize = []
    let composed = {}

    for (const layer of layers) {
        if (mustBeBuilt(layer)) {

        } else if (isServiceLayer(layer)) {

        } else {
            const next = Object.fromEntries(
                Object.entries(layer).map(([name, func]) => {
                    let composedFunction

                    const existing = composed[name]
                    if (existing) {
                        composedFunction = function(...args) {existing.call(this, args); func.call(this, args)}
                    } else {
                        composedFunction = function(...args) {func.call(this, args)}
                    }

                    return [name, composedFunction]
                })
            )

            Object.assign(composed, next)
        }
    }

    function constructor(data) {
        return Object.fromEntries(Object.entries(composed).map(([name, func]) => {
            return [name, func.bind(data)]
        }))
    }
    constructor.lc = lcSymbol

    return constructor
}

/* Object that who's keys are not all arrays or composed functions */
function isServiceLayer(l) {
    return Object.values(l).indexOf(_ => Array.isArray(_) || _.lc === lcSymbol) !== -1
}

function mustBeBuilt(l) {
    return isFunction(l)
}

function isFunction(what) {
    return (typeof what === 'function') // fixme, this will not always be correct
}
