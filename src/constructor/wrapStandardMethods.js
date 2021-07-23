import {IS_DEV_MODE} from "../const"

function wrapThen(instance) {
    if (instance.then) {

        const then = instance.then
        instance.then = (onFulfilled, onRejected) => {
            if (IS_DEV_MODE && typeof onFulfilled != "function") {
                throw new Error("Improper use of Async: `onFulfilled` must be a function")
            }
            then({
                onFulfilled: () => {
                    const restoreTo = instance.then
                    instance.then = null
                    onFulfilled(instance)
                    instance.then = restoreTo
                },
                onRejected: onRejected || null
            })

            // return null
            return instance
        }

    } else {
        instance.then = null
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
