import {queueForExecution} from "./queueForExecution"

export function functionComposer(existing, next) {
    /*
    * Queueing happens around each individual call (eg. what if it returns a promise / is async)
    * */

    // if no existing, queue just the current
    if (!existing) {
        return ($,_,opt) => queueForExecution($, () => next($,_,opt))

    } else {
        return function ($, _, opt, compressionMethod) {

            // existing call should be already queued
            existing($, _, opt, compressionMethod)

            next && queueForExecution($, () => next($, _, opt))
        }
    }
}

