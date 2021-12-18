import {$dataPointer, $isNullCore, IS_DEV_MODE} from "../const"
import {isPromise}                              from "../utils"
import {queueForExecution}                      from "../compose/queueForExecution"

export default async function constructCoreObject(proposed) {
    let core

    if (isPromise(proposed)) {
        core = await proposed
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
