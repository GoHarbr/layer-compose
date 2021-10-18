import {queueForExecution} from "./queueForExecution"

function wrapCall(fn) {
    return Object.isExtensible(fn) ?
        ($, _, opt, compressionMethod) => fn($, _, opt, compressionMethod)
        : ($, _, opt, compressionMethod) => fn.call($, opt)
}

export function functionComposer(existing, func) {
    const nextCall = func && wrapCall(func)

    // if no existing, queue just the current
    if (!existing) {
        return ($,_,opt) => queueForExecution($, () => nextCall($,_,opt))

    } else {
        const existingCall = wrapCall(existing)

        return function ($, _, opt, compressionMethod) {

            // existing call should be already queued
            existingCall($, _, opt, compressionMethod)

            nextCall && queueForExecution($, () => nextCall($, _, opt))
        }
    }
}

