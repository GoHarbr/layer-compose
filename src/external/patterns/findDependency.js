import { $isCompositionInstance } from "../../const"
import { core_unsafe } from "./core"
import { isExtensionOf } from "./isExtensionOf"
import { parent } from './parent'
import { isSameInstance } from "./isSameInstance"

export function findDependency($, ofType, opts, exclude = null) {
    const core = core_unsafe($)

    if (!exclude) exclude = $
    for (const v of Object.values(core)) {
        if (v && v[$isCompositionInstance]) {
            if (isExtensionOf(v, ofType) && !isSameInstance(v, exclude)) {
                return v
            }
        }
    }

    const p = parent($)
    if (!p) {
        throw new Error("Composition has no dependency of given type in the parental chain")
    }

    if (isExtensionOf(p, ofType) && !isSameInstance(p, exclude)) {
        return p
    } else {
        return findDependency(p, ofType, opts, exclude)
    }

}

