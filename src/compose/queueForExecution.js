import { $currentExecutor, $executionQueue, IS_DEV_MODE } from "../const"
import { isPromise } from "../utils"
import core from "../external/patterns/core"
import asap from "asap/raw"

let id = 0

export function queueForExecution($, fn, cb, { push = false, next = false, prepend = false } = {}) {
    const queue = getExecutionQueue($)

    const item = { fn, cb, id: id++ }
    if (prepend) {
        if (queue.buffer) {
            queue.buffer.push(item)
        } else {
            queue.unshift(item)
        }
    } else if (next) {
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
        await execute(queue, $)

    } catch (e) {
        catchWith.forEach(cb => cb(e))
    }
}

export function getExecutionQueue($) {
    return core($)[$executionQueue] || (core($)[$executionQueue] = [])
}

async function execute(queue, $) {
    const next = queue.shift()
    if (!next) {
        queue[$currentExecutor] = null

        return null
    }

    const { fn, cb } = next

    if (queue.buffer != null) debugger
    queue.buffer = []

    try {
        const fnReturn = fn()

        if (fnReturn) {
            if (isPromise(fnReturn)) {
                queue.unshift(...queue.buffer)
                queue.buffer = null

                const res = await fnReturn

                cb && cb(res)

                return execute(queue, $)

            } else if (fnReturn[Symbol.asyncIterator] || fnReturn[Symbol.iterator]) {
                const res = fnReturn.next()

                queue.unshift(...queue.buffer)
                queue.buffer = null

                const { value, done } = await res

                if (!done) {
                    queueForExecution($,() => {
                        return fnReturn
                    }, null, {next: true})
                }

                if (value) {
                    typeof value === 'function' ?
                        queueForExecution($, value, null, {next: true})
                        : $(value)
                }

                return execute(queue, $)

            }
        }

        // all other cases

        queue.unshift(...queue.buffer)
        queue.buffer = null

        cb && cb(fnReturn)


        return execute(queue, $)

    } catch (e) {
        console.warn('!! Queue task failed:', e)
        throw e
    }
}
