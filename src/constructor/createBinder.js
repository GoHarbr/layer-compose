/*
* Wraps instance into a builder pattern & autobinds
* */

import {isService, renameIntoGetter} from "../utils"
import {$isCompositionInstance}      from "../const"

export default function createBinder(composed) {
    let constructor

    for (const prop in composed) {
        const _c = constructor
        constructor = (instance) => {
            // make sure getters/setters are non iterable props
            const f = instance[prop]

            if (!f[$isCompositionInstance]) {
                const isGetter = !!renameIntoGetter(prop)

                /** Getters are the only way to escape out of the builder pattern */
                if (isGetter) {
                    instance[prop] = function (...args) {
                        return f.apply(instance, args)
                    }
                } else {
                    instance[prop] = function (...args) {
                        f.apply(instance, args)

                        // to allow a builder pattern
                        return instance
                    }
                }
            }

            if (_c) _c(instance)
        }
    }

    return constructor
}
