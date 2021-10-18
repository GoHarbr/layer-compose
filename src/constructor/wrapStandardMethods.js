import {IS_DEV_MODE}       from "../const"
import {queueForExecution} from "../compose/queueForExecution"

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

        queueForExecution(instance, onFulfilled)

        return instance
    }
}

function wrapJson(instance) {
    if ("json" in instance) {
        instance.toJSON = () => instance.json
    }
}

export default function wrapStandardMethods(instance) {
    wrapThen(instance)
    wrapJson(instance)
}
