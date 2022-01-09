import {$currentExecutor, $executionQueue, IS_DEV_MODE} from "../const"
import {isPromise}                                      from "../utils"
import core                                             from "../external/patterns/core"
import asap                                             from "asap/raw"
import {writeTypesToDisk}                               from "../auto-type/trackTypes"

let id = 0
export function queueForExecution($, fn, cb, {push = false, next = false} = {}) {
    const queue = getExecutionQueue($)

    const item = { fn, cb, id: id++}
    if (next) {
        queue.unshift(item)
    } else if (queue.buffer != null && !push) {
        queue.buffer.push(item)
    } else {
        queue.push(item)
    }

    if (!queue[$currentExecutor]) {
        const catchWith = []
        if (IS_DEV_MODE) {
            catchWith.push(e => console.error(e))
        }
        queue[$currentExecutor] = {
            catch(cb) {
                catchWith.push(cb)
            }
        }

        asap(() => _execute($, queue, catchWith))
    }
}

async function _execute($, queue, catchWith) {
    try {
        await execute(queue)

        if (IS_DEV_MODE) {
            writeTypesToDisk()
        }

    } catch (e) {
        catchWith.forEach(cb => cb(e))
    }
}

export function getExecutionQueue($) {
    return core($)[$executionQueue] || (core($)[$executionQueue] = [])
}

async function execute(queue) {
    const next = queue.shift()
    if (!next) {
        queue[$currentExecutor] = null

        return null
    }

    const { fn, cb } = next

    if (queue.buffer == null) queue.buffer = []

    const fnReturn = fn()

    if (isPromise(fnReturn)) {

        const res = await fnReturn.catch(e => {
            console.error('Queue task: Promise rejected:', e)
            throw e
        })

        queue.unshift(...queue.buffer)
        queue.buffer = null

        cb && cb(res)

        await execute(queue)
    } else {
        queue.unshift(...queue.buffer)
        queue.buffer = null

        cb && cb(fnReturn)

        await execute(queue)
    }
}
