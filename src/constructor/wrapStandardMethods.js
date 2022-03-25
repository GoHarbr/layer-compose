import { $currentExecutor, IS_DEV_MODE } from "../const"
import { getExecutionQueue, queueForExecution } from "../compose/queueForExecution"
import { deepJSON } from "../external/utils/deepJSON"

let id = 0
function wrapThen(instance) {
    const then = instance.then

    instance.then = (onFulfilled, onRejected) => {
        if (IS_DEV_MODE && typeof onFulfilled != "function") {
            throw new Error("Improper use of Async: `onFulfilled` must be a function")
        }

        then && then({
            onFulfilled: () => {},
            onRejected: onRejected || null
        })

        let catchId
        if (onRejected) {
            queueForExecution(instance, () => {
                catchId = id++
                getExecutionQueue(instance)[$currentExecutor].catch(onRejected, 'standard-methods-' + catchId)
            }, null, { immediate: true })
        }

        queueForExecution(instance, () => {
            if (catchId) {
                getExecutionQueue(instance)[$currentExecutor].removeCatch('standard-methods-' + catchId)
            }
            return onFulfilled()
        }, null, {push: true})

    }

    instance.catch = (onRejected, marker) => {
        if (IS_DEV_MODE && typeof onRejected != "function") {
            throw new Error("Improper use of Async: `onRejected` must be a function")
        }

        if (onRejected) {
            queueForExecution(instance, () => {
                const thisId = marker ? marker : 'standard-methods-' + id++
                getExecutionQueue(instance)[$currentExecutor].catch(onRejected, thisId)
            }, null, { next: true })
        }
    }
}

function wrapJson(instance) {
    instance.toJSON = (options) => {
        return deepJSON(instance, options)
    }
}

export default function wrapStandardMethods(instance) {
    wrapThen(instance)
    wrapJson(instance)
}
