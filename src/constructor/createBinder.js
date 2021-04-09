/*
* Wraps instance into a builder pattern & autobinds
* */

export default function createBinder(composed) {
    let constructor

    for (const prop in composed) {
        const _c = constructor
        constructor = (instance) => {
            // make sure getters/setters are non iterable props
            const f = instance[prop]
            instance[prop] = function (...args) {
                f.apply(instance, args)

                // to allow a builder pattern
                return instance
            }

            if (_c) _c(instance)
        }
    }

    return constructor
}