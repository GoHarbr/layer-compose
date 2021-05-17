import layerCompose from '../../layerCompose'

export default layerCompose(
    {
        await($,_,opt) {
            _.executionQueue.push(opt)
            $.execute()
        },
        async execute($, _) {
            if (!_.isExecuting) {

                _.isExecuting = true
                _.executionQueuePromise = execute(_.executionQueue)

                await _.executionQueuePromise
                _.isExecuting = false
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

async function execute(queue) {
    while(queue.length) {
        const what = queue.shift()
        if (typeof what === "function") {
            await what()
        } else {
            await what
        }
    }
}
