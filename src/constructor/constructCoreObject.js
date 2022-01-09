import {$isNullCore, IS_DEV_MODE} from "../const"
import {isPromise}                from "../utils"
import {unwrapCompositionAsCore}  from "./unwrapCompositionAsCore"

export default async function constructCoreObject(proposed, composition) {
    let core

    proposed = unwrapCompositionAsCore(proposed, composition)
    if (isPromise(proposed)) {
        core = await proposed
    } else {
        core = proposed
    }


    if (core == null) {
        core = {}

        if (IS_DEV_MODE) {
            core[$isNullCore] = true
        }
    } else {
        // Promises are objects
        if (typeof core !== "object") {
            throw new Error('Data must be an object (not a primitive)')
        }
    }


    return core
}
