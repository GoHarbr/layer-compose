import { $isCompositionInstance, $tag } from "../../const"
import { core_unsafe } from "./core"
import { isExtensionOf } from "./isExtensionOf"
import { GLOBAL_DEBUG } from "../utils/enableDebug"
import { findLocationFromError } from "../utils/findLocationFromError"
import { parent } from './parent'

export function findDependency($, ofType, {location} = {}) {
    const core = core_unsafe($)

    for (const v of Object.values(core)) {
        if (v && v[$isCompositionInstance]) {
            if (isExtensionOf(v, ofType)) {

                notify(ofType, location)

                return v
            }
        }
    }

    const p = parent($)
    if (!p) {
        throw new Error("Composition has no dependency of given type in the parental chain")
    }

    if (isExtensionOf(p, ofType)) {
        notify(ofType, location)

        return p
    } else {
        return findDependency(p, ofType)
    }

}

function notify(ofType, location) {
    if (GLOBAL_DEBUG.enabled) {
        const header = `${ofType[$tag]} injected`
        console.debug(`<<|  ${header.padEnd(95)} :: ${findLocationFromError(location) || ''}`)
    }
}
