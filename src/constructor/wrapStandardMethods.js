export default function wrapStandardMethods(instance) {
    if (instance.then) {

        const then = instance.then
        instance.then = (onFulfilled, onRejected) => {
            then({
                onFulfilled: () => {
                    const restoreTo = instance.then
                    instance.then = null
                    onFulfilled(instance);
                    instance.then = restoreTo
                },
                onRejected: onRejected || null
            });

            return null
        }

    } else {
        instance.then = null
    }
}
