export default function wrapStandardMethods(instance) {
    if (instance.then) {
        instance.then = (onFulfilled, onRejected) => instance.then({onFulfilled, onRejected})
    } else {
        instance.then = null
    }
}
