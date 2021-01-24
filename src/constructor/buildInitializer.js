import {$dataPointer, $initializer, $isInitialized, $runOnInitialize, IS_DEV_MODE} from "../const"
import {getDataFromPointer, isFunction}                                            from "../utils"

const emptyFn = () => {}

export default function buildInitializer(composed) {
    if (isFunction(composed[$runOnInitialize])) throw new Error()

    const initFunctions = composed[$runOnInitialize]

    /* fixme make awaitable if any return a promise or make compositions thenable */
    const composedInitializers = initFunctions.length === 0 ? emptyFn :
        initFunctions.reduce(function (a, b) {
            return function (instance) {
                // layers go in order from bottom (first executed) to top (last executed)
                a(instance)
                b(instance)
            }
        })


    if (IS_DEV_MODE) {
        return function initialize(instance) {
            if (composed[$isInitialized]) {
                throw new Error()
            }

            composedInitializers(instance)
            instance[$isInitialized] = true
        }
    } else {
        return function initialize(instance) {
            composedInitializers(instance)
        }
    }
}

