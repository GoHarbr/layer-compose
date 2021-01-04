import {$isService, $onInitialize, $setData, IS_DEV_MODE} from "../const"
import {createInstance}                                   from "./createInstance"
import {_wrapDataWithProxy, wrapDataWithProxy}            from "../proxies"


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
        }
    }


    function buildInitializer(instance) {
        const initFunctions = composedLayers[$onInitialize]
        const initializer = initFunctions.length === 0 ? undefined :
            initFunctions.reduce((a, b) => function (instance) {
                // layers go in order from bottom (first executed) to top (last executed)
                a(instance)
                b(instance)
            })

        return function initialize() {
            initializer && initializer(instance)
            for (const name of serviceNames) {
                compositionInstance[name][$onInitialize]()
            }
        }
    }


    constructor.asService = (additionalServices) => {
        const {compositionInstance, serviceNames} = createInstance(composedLayers)

        // fixme, no access through $
        const _asn = Object.keys(additionalServices)
        const conflictingName = serviceNames.find(_ => _asn.includes(_))
        if (conflictingName) {
            throw new Error('Service is already defined: ' + conflictingName)
        }

        Object.assign(compositionInstance, additionalServices)

        compositionInstance[$isService] = true
        compositionInstance[$onInitialize] = buildInitializer(compositionInstance)
        return compositionInstance
    }

    return constructor
}
