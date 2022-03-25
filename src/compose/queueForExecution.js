import {
    $currentExecutor,
    $executionQueue,
    $isCompositionInstance,
    $isFailed,
    $isInitialized,
    $traceId,
    IS_DEV_MODE
} from "../const"
import { isAwaitable } from "../utils"
import core from "../external/patterns/core"
import asap from "asap/raw"
import { GLOBAL_DEBUG } from "../external/utils/enableDebug"
import initialize from "../constructor/initialize"

let id = 0
const deadlocks = {}
let lastExecutionTime = -1
export function getDeadlocks() {
    return {functions: {...deadlocks}, lastExecutionTime}
}

export function queueForExecution($, fn, cb, { push = false, next = false, prepend = false, immediate = false, at } = {}) {
    const queue = getExecutionQueue($)

    if ($[$isFailed] && !$[$isInitialized]) {
        initialize($, null)
    }

    const item = { fn, cb, id: id++, at: GLOBAL_DEBUG.trackDeadlocks && (at || new Error('Deadlock tracking')) }
    if (prepend) {
        if (queue.buffer) {
            queue.buffer.push(item)
        } else {
            queue.unshift(item)
        }
    } else if (immediate) {
        if (queue.buffer) {
            queue.buffer.unshift(item)
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

    queue[$currentExecutor].start()
}

async function _execute($, queue) {
    try {
        await execute(queue, $)
    } catch (e) {
        queue[$currentExecutor].fail(e)
    }
}

export function getExecutionQueue($) {
    const queue = core($)[$executionQueue] || (core($)[$executionQueue] = [])

    if (!queue[$currentExecutor]) {
        let catchWith = {}
        let catchId = 1

        catchWith['print'] = (e => console.error('!!! Handling error :: ', e))

        let isStarted = false
        queue[$currentExecutor] = {
            stop() {
                isStarted = false
            },
            start() {
                if (!isStarted) {
                    $[$isFailed] = false
                    isStarted = true
                    asap(() => _execute($, queue))
                }
            },
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
                $[$isInitialized] = false
                $[$isFailed] = true

                queue[$currentExecutor].stop()

                queue.buffer = null
                queue.length = 0
                Object.entries(catchWith).forEach(([id, cb]) => {
                    if (IS_DEV_MODE) console.warn('Catching error with ' + id)
                    cb(e, $)
                })
                catchWith = {}
            },
        }
    }

    return queue
}

async function execute(queue, $) {
    const currentEntry = queue.shift()
    if (!currentEntry) {
        queue[$currentExecutor].stop()
        return null
    }

    const { fn, cb } = currentEntry

    if (queue.buffer != null) debugger
    queue.buffer = []

    try {
        if (GLOBAL_DEBUG.trackDeadlocks) {
            deadlocks[currentEntry.id] = {at: currentEntry.at, traceId: $[$traceId]}
            lastExecutionTime = Date.now()
        }

        const fnReturn = fn()
        if(GLOBAL_DEBUG.trackDeadlocks) {
            deadlocks[currentEntry.id].fnReturn = fnReturn
        }


        if (fnReturn) {
            if (isAwaitable(fnReturn)) {
                queue.unshift(...queue.buffer)
                queue.buffer = null

                const res = await fnReturn

                if (handleError(res, queue)) {
                    return
                } else {
                    cb && cb(res)

                    if (GLOBAL_DEBUG.trackDeadlocks) delete deadlocks[currentEntry.id]
                    return execute(queue, $)
                }
            } else if (fnReturn[Symbol.asyncIterator] || fnReturn[Symbol.iterator] && !Array.isArray(fnReturn)) {
                const res = fnReturn.next()

                const buffer = queue.buffer
                queue.buffer = null


                let doContinue
                queueForExecution($,() => {
                    return doContinue && fnReturn
                }, null, {next: true, at: currentEntry.at})

                const { value, done } = await res

                if (!done) {doContinue = true}

                const next = await value

                if (GLOBAL_DEBUG.trackDeadlocks) delete deadlocks[currentEntry.id]
                if (handleError(next, queue)) {
                    return
                }

                if (next && !next[$isCompositionInstance]) {
                    if (typeof next === 'function') {
                        queueForExecution($, () => {next()}, cb, {next: true, at: currentEntry.at})
                    } else {
                        throw new Error("Cannot yield a value; must be a function to queue or void")
                    }
                }


                // make sure to flush buffer before executing the yielded function
                queue.unshift(...buffer)

                return execute(queue, $)
            } else if (handleError(fnReturn, queue)) {
                if (GLOBAL_DEBUG.trackDeadlocks) delete deadlocks[currentEntry.id]
                return
            }
        }

        // all other cases

        queue.unshift(...queue.buffer)
        queue.buffer = null

        cb && cb(fnReturn)

        if (GLOBAL_DEBUG.trackDeadlocks) delete deadlocks[currentEntry.id]
        return execute(queue, $)

    } catch (e) {
        queue[$currentExecutor].fail(e)

        if (GLOBAL_DEBUG.enabled) {
            console.error('EXITING', e)
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
