import { GLOBAL_DEBUG } from "../utils/enableDebug"
import { $fullyQualifiedName, $tag, $traceId } from "../const"
import { findLocationFromError } from "../utils/findLocationFromError"

export default function ($) {
    if (GLOBAL_DEBUG.enabled) {
        const at = new Error()
        const header = `()   ${''.padEnd(25)}  ${$[$fullyQualifiedName] || $[$tag] || ''} [${$[$traceId].toString() || ''}]`
        console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at)}`)
    }
}
