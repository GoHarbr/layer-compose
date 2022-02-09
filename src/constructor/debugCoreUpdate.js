import { GLOBAL_DEBUG } from "../external/utils/enableDebug"
import { $fullyQualifiedName, $tag } from "../const"
import { findLocationFromError } from "../external/utils/findLocationFromError"

export default function ($) {
    if (GLOBAL_DEBUG.enabled) {
        const at = new Error()
        const header = `()   ${$[$fullyQualifiedName] || $[$tag] || ''}`
        console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at)}`)
    }
}
