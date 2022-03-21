import { $currentExecutor, IS_DEV_MODE } from "../const"
import { getExecutionQueue, queueForExecution } from "../compose/queueForExecution"
import core from "../external/patterns/core"

let id = 0
function wrapThen(instance) {
    const then = instance.then

    instance.then = (onFulfilled, onRejected) => {
        if (IS_DEV_MODE && typeof onFulfilled != "function") {
            throw new Error("Improper use of Async: `onFulfilled` must be a function")
        }
        id += 1

        then && then({
            onFulfilled: () => {},
            onRejected: onRejected || null
        })

        if (onRejected) {
            queueForExecution(instance, () => {
                getExecutionQueue(instance)[$currentExecutor].catch(onRejected, 'standard-methods-' + id)
            }, null, { immediate: true })
        }

        queueForExecution(instance, () => {
            getExecutionQueue(instance)[$currentExecutor].removeCatch('standard-methods-' + id)
            return onFulfilled()
        }, null, {push: true})

        return instance
    }

    instance.catch = (onRejected, marker) => {
        if (IS_DEV_MODE && typeof onRejected != "function") {
            throw new Error("Improper use of Async: `onRejected` must be a function")
        }
        id += 1
        const thisId = marker ? marker + '-' + id : 'standard-methods-' + id

        if (onRejected) {
            queueForExecution(instance, () => {
                getExecutionQueue(instance)[$currentExecutor].catch(onRejected, thisId)
            }, null, { next: true })
        }

        return instance
    }
}

function wrapJson(instance) {
    instance.toJSON = () => {
        if ("_JSON" in instance) {
            return instance._JSON
        }
        return core(instance)
    }
}

export default function wrapStandardMethods(instance) {
    wrapThen(instance)
    wrapJson(instance)
}
