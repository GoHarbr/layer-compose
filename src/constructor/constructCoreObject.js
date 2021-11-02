import {$isNullCore, IS_DEV_MODE} from "../const"

export default function constructCoreObject(proposed) {
    let core

    if (proposed == null) {
        core = {}
        if (IS_DEV_MODE) {
            core[$isNullCore] = true
        }
    } else {
        core = proposed

        // Promises are objects
        if (typeof core !== "object") {
            throw new Error('Data must be an object (not a primitive)')
        }
    }


    return core
}
