import {$isService, $onInitialize, $setData, IS_DEV_MODE} from "../const"
import {createInstance}                                   from "./createInstance"
import {wrapDataWithProxy}                                from "../proxies"


export function createConstructor(composedLayers) {
    const {compositionInstance, serviceNames} = createInstance(composedLayers)

    function constructor(data) {
        if (data !== undefined) compositionInstance[$setData](data)
        initialize()

        if (IS_DEV_MODE) {
            // fixme. use own proxy to prevent sets / throw on gets
            return wrapDataWithProxy(compositionInstance, {/* empty borrow, thus no setting */}, {isGetOnly: false})
        }
    }


    const initializer = composedLayers[$onInitialize].length === 0 ? undefined :
        composedLayers[$onInitialize].reduce((a, b) => function (instance) {
            // layers go in order from bottom (first executed) to top (last executed)
            a(instance)
            b(instance)
        })

    function initialize() {
        initializer && initializer(compositionInstance)
        for (const name of serviceNames) {
            compositionInstance[name][$onInitialize]()
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
        compositionInstance[$onInitialize] = initialize
        return compositionInstance
    }

    return constructor
}
