import {$isNullCore, IS_DEV_MODE} from "../const"

export default function constructCoreObject(proposed, $) {
    let core
    if (typeof proposed === "function") {
        core = proposed($)
    } else if (proposed == null) {
        core = {}
        if (IS_DEV_MODE) {
            core[$isNullCore] = true
        }
        // todo. add a DEV marker that this is a null core for single-use lenses/services
    } else {
        core = proposed
    }

    if (typeof core !== "object") {
        throw new Error('Data must be an object (not a primitive)')
    }

    return core
}
