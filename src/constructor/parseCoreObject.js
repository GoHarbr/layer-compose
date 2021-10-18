import {isPromise}         from "../utils"
import {queueForExecution} from "../compose/queueForExecution"

export default function parseCoreObject(proposed, $) {
    let core
    if (typeof proposed === "function") {
        core = proposed($)
    } else if (proposed == null) {
        core = {}
    } else {
        core = proposed
    }

    if (typeof core !== "object") {
        throw new Error('Data must be an object (not a primitive)')
    }

    return core
}
