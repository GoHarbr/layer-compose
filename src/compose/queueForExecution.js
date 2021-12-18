import {$executionQueue, IS_DEV_MODE} from "../const"
import {isPromise}                    from "../utils"
import core              from "../external/patterns/core"

export function queueForExecution($, fn, cb) {
    const queue = getExecutionQueue($)

    if (queue.buffer != null) {
        queue.buffer.push({ fn, cb })
    } else {
        queue.push({ fn, cb })
    }

    if (!queue.currentExecutor) {
        queue.currentExecutor = new Promise((resolve, reject) => {
            try {
                execute($)
                resolve()
            } catch (e) {
                reject(e)
            }
        })
    }
}

export function getExecutionQueue($) {
    return core($)[$executionQueue] || (core($)[$executionQueue] = [])
}

function execute($) {
    const queue = getExecutionQueue($)

    const next = queue.shift()
    if (!next) {
        queue.currentExecutor = null

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
