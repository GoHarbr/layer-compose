import layerCompose from '../../index'

export default layerCompose(
    {
        await($,_,opt) {
            _.executionQueue.push(opt)
            $.execute()
        },
        async execute($, _) {
            _.isExecuting = true
            await execute(_.executionQueue)
            _.isExecuting = false
        }
    }
).partial(
    {
        executionQueue: []
    }
)

async function execute(queue) {
    while(queue.length) {
        await queue.shift()
    }
}
