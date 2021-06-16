import layerCompose  from '../../layerCompose'
import transform     from "../patterns/transform"
import defaults      from "../patterns/defaults"
import {IS_DEV_MODE} from "../../const"

const Await = layerCompose(
    transform(() => ({})),
    defaults({
        isExecuting: false,
        executionQueue: () => [],
        executionQueuePromise: () => Promise.resolve()
    }),

    {
        await($, _, opt) {
            let toQueue = opt
            if (typeof toQueue === "function") {
                toQueue = () => opt($, _)
            } else if (IS_DEV_MODE && typeof toQueue?.then != "function") {
                throw new Error("Non-promise values should not be queued")
            }

            _.executionQueue.push(toQueue)
            $.executeAllAwaitables()
        },
        executeAllAwaitables($, _) {
            if (!_.isExecuting) {

                _.isExecuting = true
                _.executionQueuePromise = new Promise((onFulfilled, onRejected) => {
                    const done = (e) => {
                        _.isExecuting = false

                        // todo. should the queue be cleared up in case of a rejection?

                        !e && onFulfilled() || onRejected(e)
                    }
                    executeAsyncQueue(_.executionQueue, done)
                })
            }
        },
        mustBeAwaited($, _) {
            if (_.isExecuting) {
                throw new Error("This function must execute after all other promises have been resolved")
            }
        },

        then($, _, opt) {
            if (typeof opt == "function") {
                _.executionQueuePromise.then(opt)
            } else {
                _.executionQueuePromise.then(opt.onFulfilled, opt.onRejected)
            }
        },
    }
)

export default layerCompose({
    mustBeAwaited($, _, opt) {
        return $.Await.mustBeAwaited(opt)
    },
    await($, _, opt) {
        return $.Await.await(opt)
    },
    then($, _, opt) {
        return $.Await.then(opt.onFulfilled, opt.onRejected)
    },

    Await,
})

function executeAsyncQueue(queue, done) {
    if (queue.length) {
        const what = queue.shift()

        if (typeof what === "function") {
            try {

                const p = what()

                if (p != null && "then" in p && typeof p.then == "function") {
                    p.then(() => executeAsyncQueue(queue, done), done)
                } else {
                    executeAsyncQueue(queue, done)
                }
            } catch (e) {
                done(e)
            }
        } else {
            what.then(() => executeAsyncQueue(queue, done), done)
        }
    } else {
        done()
    }
}
