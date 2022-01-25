import {$dataProxyMap, $executionQueue, $isNullCore, $parentInstance, IS_DEV_MODE} from "../const"
import {isPromise}                                                                 from "../utils"
import {unwrapCompositionAsCore}  from "./unwrapCompositionAsCore"
import {unwrapProxy}              from "../proxies/utils"

export default async function constructCoreObject(proposed, composition) {
    let core

    // proposed = unwrapCompositionAsCore(proposed, composition)
    if (isPromise(proposed)) {
        core = await proposed
    } else {
        core = proposed
    }

    if (IS_DEV_MODE) {
        core = unwrapProxy(core)
    }

    // checking if it's a core ($dataPointer)
    // and removing properties that must not transfer
    if (core[$executionQueue]) {
        core = Object.assign({}, core)
        core[$parentInstance] = null
        core[$executionQueue] = null
        core[$dataProxyMap] = null

        // keeping the borrowedKeys
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
