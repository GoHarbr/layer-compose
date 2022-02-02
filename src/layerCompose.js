import { $at, $isLc, IS_DEV_MODE } from "./const"
import { createConstructor } from "./constructor/createConstructor"
import { findLocationFromError } from "./external/utils/findLocationFromError"

export default function layerCompose(...layers) {
    if (layers.length === 1 && Array.isArray(layers[0])) {
        layers = layers[0]
    }
    if (layers.some(_ => !_)) {
        throw new Error("A layer cannot be nothing")
    }

    try {

        if (!layers[$at]) {
            layers[$at] = new Error()
        }

        return createConstructor(layers)

    } catch (e) {
        console.error("layerCompose encountered an error while creating a constructor for a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}


export function $ (layer, baseLayer, {unsafe = true, depth = 1} = {}) {
    if (depth > 3) {
        console.warn('Use `layerCompose(...layers)` syntax for more than 3 layers chained together with o.$().$()', findLocationFromError(new Error()))
    }
    if (!layer?.[$isLc] && typeof layer != 'object' || Array.isArray(layer) || layer == null) {
        throw new Error('A layer must be an object')
    }
    if (unsafe) {
        console.warn('Unsafe use of $ to compose. Used tethered form (prevents bugs) : `o.$().$() ... `')
        console.warn(findLocationFromError(new Error()))
    }

    const c = baseLayer ? layerCompose(layer, baseLayer) : layerCompose(layer)

    c.$ = layer => $(c, layer, {unsafe, depth: depth + 1})

    return c
}

export const o = (name) => {
    if (name) throw new Error('Naming of layers and compositions is not yet supported')
}
o.$ = (layer) => {
    return $(layer, null,{unsafe: false})
}

const capitalRe = /[A-Z]/
const nonCapital = /[_]?[a-z]+.*/

export function lc(tag) {
    const layers = []
    layers[$at] = new Error()

    let constructor

    return new Proxy(() => {}, {
        get(target, prop) {
            if (!constructor) constructor = layerCompose(layers)

            return constructor[prop]
        },

        set(target, prop, value) {
            if (typeof prop == 'symbol') {
                constructor[prop] = value
                return true
            }

            if (constructor) throw new Error(`Can't add layers after the constructor has been created`)
            if (!value || (typeof value !== "object" && !value[$isLc])) {
                throw new Error('a Layer must be an object, composition constructor or an async import')
            }

            const isLens = capitalRe.test(prop[0])
            const at = new Error()

            if (isLens) {
                layers.push({[prop]: value, [$at]: at})
            } else {
                if (!nonCapital.test(prop)) {
                    throw new Error('layer names must start with an optional `_` and a lowercase letter. Not valid: ' + prop)
                }
                if (prop in target) throw new Error('Layer with such name already exists')
                layers.push(value)
                target[prop] = true
            }

            return true
        },

        apply(target, thisArg, args) {
            if (!constructor) constructor = layerCompose(layers)

            return constructor(...args)
        }
    })
}
