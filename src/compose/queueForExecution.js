import {$executionQueue, IS_DEV_MODE} from "../const"
import {isPromise}                    from "../utils"
import core              from "../external/patterns/core"

export function queueForExecution($, fn, cb) {
    const queue = getQueue($)

    if (queue.buffer != null) {
        queue.buffer.push({ fn, cb })
    } else {
        queue.push({ fn, cb })
    }

    if (!queue.isExecuting) {
        queue.isExecuting = true
        new Promise(resolve => resolve(execute($)))
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

    if (queue.buffer == null) queue.buffer = []

    const fnReturn = fn()

    if (isPromise(fnReturn)) {
        if (IS_DEV_MODE) {
            fnReturn.catch(e => {
                console.error('Promise rejected:', e)
                throw e
            })
        }
        fnReturn.then(res => {
            queue.unshift(...queue.buffer)
            queue.buffer = null

            cb && cb(res)

            execute($)
        })
    } else {
        queue.unshift(...queue.buffer)
        queue.buffer = null

        cb && cb(fnReturn)

        execute($)
    }
}
