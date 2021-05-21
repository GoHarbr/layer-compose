import {combineResult} from "./combineResult"

function wrapCall(fn) {
    return Object.isExtensible(fn) ?
        ($, _, opt, compressionMethod) => fn($, _, opt, compressionMethod)
        : ($, _, opt, compressionMethod) => fn.call($, opt)
}

export function functionComposer(existing, func) {

    // const isAsync = existing.isAsync || func.isAsync || func[Symbol.toStringTag] === 'AsyncFunction'
    // todo. deprecated
    const isAsync = false

    const existingCall = wrapCall(existing)
    const nextCall = wrapCall(func)

    const composed = function ($, _, opt, compressionMethod) {
        const acc = existingCall($, _, opt, compressionMethod)
        const next = nextCall($, _, opt)

        return combineResult(acc, next, isAsync, compressionMethod)
    }

    composed.isAsync = isAsync
    return composed
}
