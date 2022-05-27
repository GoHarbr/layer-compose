import lens from "../external/patterns/lens"
import { $at, $composition, $getComposition, $layers, $tag, IS_DEV_MODE } from "../const"
import { findDependency } from "../external/patterns/findDependency"
import { findLocationFromError } from "../utils/findLocationFromError"
import { GLOBAL_DEBUG } from "../utils/enableDebug"
import { isAwaitable } from "../utils"
import { isExtensionOf } from "../external/patterns/isExtensionOf"
import { is } from "../external/patterns/is"

export function wrapWithUtils(constructor) {
    /** @deprecated */
    constructor.lens = ($, applicator) => {
        console.warn('lens() is deprecated. Use getters instead')
        lens($, applicator, constructor)
    }

    constructor.mock = (...layers) => {
        layers[$at] = new Error()
        constructor[$layers] = layers
        constructor[$composition] = null
    }

    constructor.inject = ($, cb) => {
        const location = IS_DEV_MODE ? findLocationFromError(new Error()) : null
        if (IS_DEV_MODE) {
            // verify that composition is properly constructed
            constructor[$getComposition]()
        }

        const dep = findDependency($, constructor, { location })

        if (!dep) {
            throw new Error('Failed to find dependency')
        }

        notifyOfInjection(constructor, location)
        const cbRes = cb(dep)

        return {
            then: (onResolve, onReject) => {
                return isAwaitable(cbRes) ? cbRes.then(onResolve, onReject) : onResolve()
            },
            catch: (handler,id) => {
                const at = IS_DEV_MODE ? new Error() : null
                $.catch(handler, id, at)

                return new Promise((onResolve, onReject) => {
                    isAwaitable(cbRes) ? cbRes.then(onResolve, onReject) : onResolve()
                })
            }
        }
    }

    constructor.isExtendedBy = (other) => {
        return isExtensionOf(other, constructor)
    }

    constructor.is = (other) => {
        return is(other, constructor)
    }

    // constructor.injectOrSelf = ($, cb) => {
    //     if (is($, constructor)) {
    //         notifyOfInjection(constructor, location)
    //         cb($)
    //         return wrapInjected($)
    //     } else {
    //         return constructor.inject($, cb)
    //     }
    // }
}


function notifyOfInjection(ofType, location) {
    if (GLOBAL_DEBUG.enabled) {
        const header = `${ofType[$tag]} injected`
        console.debug(`<<|  ${header.padEnd(95)} :: ${location || ''}`)
    }
}
