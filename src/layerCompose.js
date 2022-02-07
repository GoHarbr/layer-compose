import { $at, $isLc, GETTER_NAMING_CONVENTION_RE, IS_DEV_MODE } from "./const"
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

const capitalRe = /^[A-Z]/
const layerRe = /^[_]+[a-z]?/

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

            const isLens = capitalRe.test(prop)
            const at = new Error()

            if (!value) throw new Error('A layer must not be nothing: ' + prop)

            if (isLens) {
                if (typeof value !== "object" && !value[$isLc]) {
                    throw new Error('Lens definition can contain only layers or compositoin constructors')
                }

                layers.unshift({ [prop]: value, [$at]: at })

                return true
            } else if (GETTER_NAMING_CONVENTION_RE.test(prop)) {

                if (typeof value !== "function") throw new Error('A getter must be a function')
                if (value.length > 1) throw new Error('A getter must take at most a single argument -- the core')
                layers.unshift({
                    [prop]: ($,_) => value(_)
                })

                return true
            } else {
                if (!layerRe.test(prop)) {
                    throw new Error('layer names must start with an optional `_` and a lowercase letter. Not valid: ' + prop)
                }
                if (typeof value !== "object" && !value[$isLc]) {
                    throw new Error('A layers must be an object, an array, or a composition constructor. It cannot be a function: ' + prop)
                }

                if (prop in target && prop !== '_') throw new Error('Layer with such name already exists: ' + prop)
                if (prop === '_' && !value[$isLc]) throw new Error('Non-composed layers must be named: ' + prop)
                layers.unshift(value)
                target[prop] = true

                return true
            }

            throw new Error('a Layer must be an object, composition constructor or an async import, or a getter')
        },

        apply(target, thisArg, args) {
            if (!constructor) constructor = layerCompose(layers)

            return constructor(...args)
        }
    })
}
