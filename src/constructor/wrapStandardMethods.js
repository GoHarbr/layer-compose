import {$currentExecutor, $dataPointer, IS_DEV_MODE} from "../const"
import {getExecutionQueue, queueForExecution}        from "../compose/queueForExecution"

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

        onRejected && queueForExecution(instance, () => {
            getExecutionQueue(instance)[$currentExecutor].catch(onRejected)
        }, null, {next: true})

        queueForExecution(instance, onFulfilled, null, {push: true})

        return instance
    }
}

function wrapJson(instance) {
    if ("json" in instance) {
        instance.toJSON = () => instance[$dataPointer]
    }
}

export default function wrapStandardMethods(instance) {
    wrapThen(instance)
    wrapJson(instance)
}
