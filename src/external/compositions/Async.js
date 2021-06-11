import layerCompose from '../../layerCompose'

export default layerCompose(
    {
        await($, _, opt) {
            let toQueue = opt
            if (typeof toQueue === "function") {
                toQueue = () => opt($,_)
            }
            _.executionQueue.push(toQueue)
            $._executeAllAwaitables()
        },
        _executeAllAwaitables($, _) {
            if (!_.isExecuting) {

                _.isExecuting = true
                _.executionQueuePromise = new Promise((onFulfilled, onRejected) => {
                    const done = (e) => {
                        _.isExecuting = false

                        // todo. should the queue be cleared up in case of a rejection?

                        !e && onFulfilled() || onRejected(e)
                    }
                    execute(_.executionQueue, done)
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
).partial(
    {
        isExecuting: false,
        executionQueuePromise: Promise.resolve()
    }
).transform(_ => {
    if (!_.executionQueue) _.executionQueue = []
})

function execute(queue, done) {
    if (queue.length) {
        const what = queue.shift()

        if (typeof what === "function") {
            try {

                const p = what()

                if (p != null && "then" in p && typeof p.then == "function") {
                    p.then(() => execute(queue, done), done)
                } else {
                    execute(queue, done)
                }
            } catch (e) {
                done(e)
            }
        } else {
            what.then(() => execute(queue, done), done)
        }
    } else {
        done()
    }
}
