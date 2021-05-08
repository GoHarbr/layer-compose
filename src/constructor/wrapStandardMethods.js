export default function wrapStandardMethods(instance) {
    if (instance.then) {

        const then = instance.then
        instance.then = (onFulfilled, onRejected) => {
            then({
                onFulfilled,
                onRejected: onRejected || null
            });

            return null
        }

    } else {
        instance.then = null
    }
}
