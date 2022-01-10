import {$parentInstance}   from "../../const"
import core, {core_unsafe} from "./core"
import {isExtensionOf}     from "./isExtensionOf"

export default function parent ($, ofType) {
    const p = core_unsafe($)[$parentInstance]
    if (!p) {
        throw new Error("Composition has no parent of given type")
    }
    if (ofType) {
        if (isExtensionOf(p, ofType)) {
            return p
        } else {
            return parent(p, ofType)
        }
    } else {
        return p
    }

}
