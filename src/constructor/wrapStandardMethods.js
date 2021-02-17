export default function wrapStandardMethods(instance) {
    // instance.then = (onFulfilled, onRejected) => instance.then({onFulfilled, onRejected})
    instance.then = null
}
