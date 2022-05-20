import { queueForExecution } from "../execution/queueForExecution"

export function functionComposer(existing, next, {isReverse} = {}) {
    /*
    * Queueing happens around each individual call (eg. what if it returns a promise / is async)
    * */

    // if no existing, queue just the current
    if (!existing) {
        return ($,_,opt) => queueForExecution($, () => next($,_,opt))

    } else {
        if (isReverse) {
            return function ($, _, opt) {
                next && queueForExecution($, () => next($, _, opt))
                // existing call should be already queued
                existing($, _, opt)
            }
        } else {
            return function ($, _, opt) {
                // existing call should be already queued
                existing($, _, opt)
                next && queueForExecution($, () => next($, _, opt))
            }
        }
    }
}

