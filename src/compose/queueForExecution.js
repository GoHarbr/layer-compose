import { $currentExecutor, $executionQueue, $isCompositionInstance, IS_DEV_MODE } from "../const"
import { isAwaitable } from "../utils"
import core from "../external/patterns/core"
import asap from "asap/raw"
import { GLOBAL_DEBUG } from "../external/utils/enableDebug"

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
        let catchWith = {}

        catchWith['print'] = (e => console.error('!!! Handling error :: ', e))

        let catchId = 1
        queue[$currentExecutor] = {
            then(cb) {
                queueForExecution($, () => {}, cb, {push: true})
            },
            catch(cb, id) {
                id = id || 'lc-catch-id-' + (catchId++)
                catchWith[id] = cb
            },
            removeCatch(id) {
                delete catchWith[id]
            },
            fail(e) {
                queue.length = 0
                Object.entries(catchWith).forEach(([id, cb]) => {
                    if (IS_DEV_MODE) console.warn('Catching error with ' + id + ' : ', e)
                    cb(e, $)
                })
                catchWith = {}
            },
        }

        asap(() => _execute($, queue))
    }
}

async function _execute($, queue) {
    try {
        await execute(queue, $)
    } catch (e) {
        queue[$currentExecutor].fail(e)
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
            if (isAwaitable(fnReturn)) {
                queue.unshift(...queue.buffer)
                queue.buffer = null

                const res = await fnReturn

                handleError(res, queue)
                cb && cb(res)

                return execute(queue, $)

            } else if (fnReturn[Symbol.asyncIterator] || fnReturn[Symbol.iterator] && !Array.isArray(fnReturn)) {
                const res = fnReturn.next()

                const buffer = queue.buffer
                queue.buffer = null


                let doContinue
                queueForExecution($,() => {
                    return doContinue && fnReturn
                }, null, {next: true})

                const { value, done } = await res

                if (!done) {doContinue = true}

                const next = await value

                if (!handleError(next, queue) && next && !next[$isCompositionInstance]) {
                    if (typeof next === 'function') {
                        queueForExecution($, () => {next()}, cb, {next: true})
                    } else {
                        throw new Error("Cannot yield a value; must be a function to queue or void")
                    }
                }

                // make sure to flush buffer before executing the yielded function
                queue.unshift(...buffer)

                return execute(queue, $)
            } else {
                handleError(fnReturn, queue)
            }
        }

        // all other cases

        queue.unshift(...queue.buffer)
        queue.buffer = null

        cb && cb(fnReturn)


        return execute(queue, $)

    } catch (e) {
        queue[$currentExecutor].fail(e)

        if (GLOBAL_DEBUG.enabled) {
            process.exit(1)
        }

        throw e
    }
}

function handleError(e, queue) {
    if (e instanceof Error) {
        queue[$currentExecutor].fail(e)

        return true
    }
    return false
}
