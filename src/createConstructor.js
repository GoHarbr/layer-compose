import {isService}                                                      from './utils'
import {$dataPointer, $isService, $onInitialize, $setData, IS_DEV_MODE} from "./const"
import wrapWithProxy                                                    from "./wrapWithProxy"

export function createConstructor(composedLayers) {
    const compositionInstance = {
        [$dataPointer]: undefined, // this is filled with actual data during instantiation
        [$setData]: setData
    }

    const serviceNames = []

    for (const name of Object.keys(composedLayers)) {
        let methodOrService = composedLayers[name]

        if (isService(methodOrService)) {
            compositionInstance[name] = methodOrService
            serviceNames.push(name)
        } else {
            const defaultOpt = {} // defaults injected into here during initialization
            compositionInstance[name] = (opt) => {
                if (IS_DEV_MODE && !!opt && typeof opt != 'object') {
                    throw new Error("Layer methods can take only named parameters")
                }
                methodOrService(compositionInstance[$dataPointer], opt || defaultOpt)
            }
        }
    }

    function constructor (data) {
        if (data !== undefined) setData(data)
        initialize()
        if (IS_DEV_MODE) {
            // fixme. use own proxy to prevent sets / throw on gets
            return wrapWithProxy(compositionInstance, {/* empty borrow, thus no setting */}, {isGetOnly: false})
        }
        return compositionInstance
    }
    function setData(d) {
        if (d === undefined) {
            d = {}
        }
        if (typeof d !== 'object') {
            throw new Error('Data must be an object')
        }
        compositionInstance[$dataPointer] = d
        for (const name of serviceNames) {
            compositionInstance[name][$setData](d)
        }
    }


    const initializer = composedLayers[$onInitialize].length === 0 ? undefined :
        composedLayers[$onInitialize].reduce((a,b) => function (instance) {
        // layers go in order from bottom (first executed) to top (last executed)
        a(instance); b(instance)
    })
    function initialize() {
        initializer && initializer(compositionInstance)
        for (const name of serviceNames) {
            compositionInstance[name][$onInitialize]()
        }
    }


    constructor.asService = () => {
        compositionInstance[$isService] = true
        compositionInstance[$onInitialize] = initialize
        return compositionInstance
    }

    return constructor
}
