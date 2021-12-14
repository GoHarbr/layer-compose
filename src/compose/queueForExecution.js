import {$executionQueue} from "../const"
import {isPromise}       from "../utils"
import core              from "../external/patterns/core"

export function queueForExecution($, fn, cb) {
    const queue = getQueue($)

    if (queue.current != null) {
        if (queue.current === 0) {
            queue.unshift({ fn, cb })
        } else {
            queue.splice(queue.current - 1, 0, { fn, cb })
        }
    } else {
        queue.push({ fn, cb })
    }

    if (queue.current != null) queue.current++

    if (!queue.isExecuting) {
        queue.isExecuting = true
        execute($)
    }
}

function getQueue($) {
    return core($)[$executionQueue] || (core($)[$executionQueue] = [])
}

function execute($) {
    const queue = getQueue($)

    const next = queue.shift()
    if (!next) {
        queue.isExecuting = false

        return
    }

    const { fn, cb } = next

    if (queue.current == null) queue.current = 0

    const fnReturn = fn()

    if (isPromise(fnReturn)) {
        fnReturn.then(res => {
            queue.current--
            queue.current = queue.current < 0 ? null : queue.current

            cb && cb(res)

            execute($)
        })
    } else {
        queue.current--
        queue.current = queue.current < 0 ? null : queue.current

        cb && cb(fnReturn)

        execute($)
    }
}
