import {$executionQueue} from "../const"
import {isPromise}       from "../utils"
import core              from "../external/patterns/core"

export function queueForExecution($, fn, cb) {
    getQueue($).push({ fn, cb })

    if (!getQueue($).isExecuting) {
        getQueue($).isExecuting = true
        execute($)
    }
}

function getQueue($) {
    return core($)[$executionQueue] || (core($)[$executionQueue] = [])
}

function execute($) {
        const next = getQueue($).shift()
        if (!next){
            getQueue($).isExecuting = false

            return
        }

        const { fn, cb } = next

        const fnReturn = fn()
        if (isPromise(fnReturn)) {
            fnReturn.then(res => {
                cb && cb(res)

                execute($)
            })
        } else {
            cb && cb(fnReturn)

            execute($)
        }
}
