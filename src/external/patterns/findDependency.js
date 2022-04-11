import { $isCompositionInstance } from "../../const"
import { core_unsafe } from "./core"
import { isExtensionOf } from "./isExtensionOf"
import { parent } from './parent'

export function findDependency($, ofType) {
    const core = core_unsafe($)

    for (const v of Object.values(core)) {
        if (v && v[$isCompositionInstance]) {
            if (isExtensionOf(v, ofType)) {

                return v
            }
        }
    }

    const p = parent($)
    if (!p) {
        throw new Error("Composition has no dependency of given type in the parental chain")
    }

    if (isExtensionOf(p, ofType)) {

        return p
    } else {
        return findDependency(p, ofType)
    }

}

