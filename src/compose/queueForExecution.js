import {$executionQueue} from "../const"
import {isPromise}       from "../utils"

export function queueForExecution($, fn, cb) {
    $[$executionQueue].push({ fn, cb })

    if (!$[$executionQueue].isExecuting) {
        $[$executionQueue].isExecuting = true
        execute($)
    }
}

function execute($) {
        const next = $[$executionQueue].shift()
        if (!next){
            $[$executionQueue].isExecuting = false

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
