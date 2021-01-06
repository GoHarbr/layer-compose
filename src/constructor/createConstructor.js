import {$initializer, $isInitialized, $isService, $runOnInitialize, $setData, IS_DEV_MODE} from "../const"
import {createInstance}     from "./createInstance"
import {_wrapDataWithProxy} from "../proxies/proxies"
import {isFunction}         from '../utils'


export function createConstructor(composedLayers) {
    const {compositionInstance, serviceNames} = createInstance(composedLayers)
    let setData = compositionInstance[$setData]
    if (!setData) {
        throw new Error()
    }

    const initialize = buildInitializer(compositionInstance)
    function constructor(data) {
        if (typeof data !== "object" && data != null) throw new Error('Data must be an object (not a primitive) or null')

        setData = compositionInstance[$setData]
        if (!setData) {
            throw new Error()
        }

        setData(data)
        initialize()

        if (IS_DEV_MODE) {
            // fixme. use own proxy to prevent sets / throw on gets
            return _wrapDataWithProxy(compositionInstance, {/* empty borrow, thus no setting */}, {isGetOnly: false})
        } else {
            return compositionInstance
        }
    }


    function buildInitializer(instance) {
        const initFunctions = composedLayers[$runOnInitialize]
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
                compositionInstance[name][$initializer]()
            }
        }
    }


    constructor.asService = () => {
        const {compositionInstance, serviceNames} = createInstance(composedLayers)

        compositionInstance[$isService] = true
        compositionInstance[$initializer] = buildInitializer(compositionInstance)
        return compositionInstance
    }

    return constructor
}
