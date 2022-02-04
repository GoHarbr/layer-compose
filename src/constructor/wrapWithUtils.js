import lens from "../external/patterns/lens"
import { $at, $layers } from "../const"

export function wrapWithUtils(constructor) {
    /** @deprecated */
    constructor.lens = ($, applicator) => {
        console.warn('lens() is deprecated. Use getters instead')
        lens($, applicator, constructor)
    }

    constructor.mock = (...layers) => {
        layers[$at] = new Error()
        constructor[$layers] = layers
    }
}
