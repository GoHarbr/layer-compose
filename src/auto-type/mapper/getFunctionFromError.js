import { findLocationFromError } from "../../utils/findLocationFromError"
import splitLocationIntoComponents from "../../utils/splitLocationIntoComponents"

const astCache = {}

export function getFunctionFromError(fnName, at) {
    let body

    const loc = findLocationFromError(at)
    if (!loc) debugger

    const {filename} = splitLocationIntoComponents(loc)

    return {name: fnName, at, filename, body: 'function hello ($,_) {}'}
}
