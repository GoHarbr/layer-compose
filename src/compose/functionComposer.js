import {combineResult} from "./combineResult"
import {$$}            from "../const"

export function functionComposer(existing, func) {

    // const isAsync = existing.isAsync || func.isAsync || func[Symbol.toStringTag] === 'AsyncFunction'
    // todo. deprecated
    const isAsync = false

    let composed
    if (Object.isExtensible(existing)) {
         composed = function ($, _, opt, compressionMethod) {
            const acc = existing($, _, opt, compressionMethod)
            const next = func($, _, opt)

            return combineResult(acc, next, isAsync, compressionMethod)
        }
    } else {
        if (Object.isExtensible(func)) {
            composed = function ($, _, opt, compressionMethod) {
                const acc = existing.call($[$$], opt)
                const next = func($, _, opt)

                return combineResult(acc, next, isAsync, compressionMethod)
            }
        } else {
            composed = function ($, _, opt, compressionMethod) {
                const acc = existing.call($[$$], opt)
                const next = func.call($[$$], opt)

                return combineResult(acc, next, isAsync, compressionMethod)
            }
        }
    }
    composed.isAsync = isAsync
    return composed
}
