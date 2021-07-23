import layerCompose  from '../../layerCompose'
import transform     from "../patterns/transform"
import defaults      from "../patterns/defaults"
import {IS_DEV_MODE} from "../../const"

const Await = layerCompose(
    transform(_ => ({awaitTarget: _})),
    defaults({
        isExecuting: false,
        error: null,
        executionQueue: () => [],
        executionQueuePromise: () => Promise.resolve()
    }),

    {
        error: false
    },

    {
        await($, _, opt) {
            if (_.error) {
                console.warn("Skipping await call, there has been an error in the flow")
            } else {
                let toQueue = opt
                if (typeof toQueue === "function") {
                    toQueue = () => opt(_.awaitTarget)
                } else if (IS_DEV_MODE && typeof toQueue?.then != "function") {
                    throw new Error("Non-promise values should not be queued")
                }

                _.executionQueue.push(toQueue)
                $.executeAllAwaitables()
            }
        },
        executeAllAwaitables($, _) {
            // todo. factor out for performance
            function makePromise() {
                return new Promise((onFulfilled, onRejected) => {
                    const done = (e) => {
                        _.isExecuting = false
                        if (e) _.error = e
                        // todo. should the queue be cleared up in case of a rejection?

                        !e && onFulfilled() || onRejected(e)
                    }
                    executeAsyncQueue(_.executionQueue, done)
                })
            }

            if (!_.isExecuting) {
                _.isExecuting = true
                // _.executionQueuePromise = _.executionQueuePromise ? _.executionQueuePromise.then(makePromise) : makePromise()
                _.executionQueuePromise = makePromise()
            }
        },
        mustBeAwaited($, _) {
            if (_.isExecuting) {
                throw new Error("This function must execute after all other promises have been resolved")
            }
        },
        resetError($,_) {
            _.executionQueuePromise = null
            _.executionQueue = []
            _.error = null
        },

        then($, _, opt) {
            if (typeof opt == "function") {
                $.await(opt)
            } else if (opt.onFulfilled) {
                if (opt.onRejected) _.executionQueuePromise.catch(opt.onRejected)
                $.await(opt.onFulfilled)
            } else {
                throw new Error("No thennable function passed into `then`")
            }
        },
        catch($,_,opt) {
            if (typeof opt === "function") {
                const f = () => opt($) // giving access to the Await composition (which has error)

                _.executionQueuePromise.catch(f)
            } else {
                throw new Error('Catch (currently) takes only a function')
            }
        },

        /**
         * @param [opt] function that is applied in the `.then` block
         * @return Promise that resolves once its place in queue comes up  */
        getPromise($,_,opt) {
            let onFulfilled, onRejected
            const p = new Promise((_onFulfilled, _onRejected) => {
                onFulfilled = _onFulfilled
                onRejected = _onRejected
            })

            /* put in queue */
            $.await(async () => {
                try {
                    let r
                    if (typeof opt == "function") {
                        r = await opt()
                    }
                    onFulfilled(r)
                } catch (e) {
                    onRejected(e)
                }
            })

            // _.executionQueuePromise.catch(onRejected)

            return p
        }
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
    catch($, _, opt) {
        return $.Await.catch(opt)
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
