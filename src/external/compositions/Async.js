import layerCompose from '../../layerCompose'

export default layerCompose(
    {
        await($,_,opt) {
            _.executionQueue.push(opt)
            $.execute()
        },
        execute($, _) {
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

        then($,_,opt) {
            _.executionQueuePromise.then(opt.onFulfilled, opt.onRejected)
        },
    }
).partial(
    {
        isExecuting: false,
        executionQueue: [],
        executionQueuePromise: Promise.resolve()
    }
)

function execute(queue, done) {
    if(queue.length) {
        const what = queue.shift()
        if (typeof what === "function") {
            const p = what()
            p.then(() => execute(queue, done), done)
        } else {
            what.then(() => execute(queue, done), done)
        }
    } else {
        done()
    }
}
