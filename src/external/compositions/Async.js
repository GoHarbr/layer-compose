import layerCompose from '../../index'

export default layerCompose(
    $ => $.init(),
    {
        init($, _) {
            _.executionQueue = []
        },
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
)

async function execute(queue) {
    while(queue.length) {
        await queue.shift()
    }
}
