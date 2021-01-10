import {$initializer, $isInitialized, $runOnInitialize} from "../const"
import {isFunction}                                     from "../utils"

export default function buildInitializer(instance, serviceNames) {
    const initFunctions = instance[$runOnInitialize]
    if (isFunction(initFunctions)) throw new Error()

    /* fixme make awaitable if any return a promise */
    const initializer = initFunctions.length === 0 ? undefined :
        initFunctions.reduce((a, b) => function (instance) {
            // layers go in order from bottom (first executed) to top (last executed)
            a(instance)
            b(instance)
        })

    return function initialize() {
        if (instance[$isInitialized]) {
            /*
            * This happens with circular access to services (by other services)
            * */
            return
        }

        initializer && initializer(instance)
        instance[$isInitialized] = true
        for (const name of serviceNames) {
            instance[name][$initializer]()
        }
    }
}

