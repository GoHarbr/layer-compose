import {$initializer, $isInitialized, $isService, $runOnInitialize, $setData, IS_DEV_MODE} from "../const"
import {createInstance}                                                                    from "./createInstance"
import {_wrapDataWithProxy}                                                                from "../proxies/proxies"
import {isFunction}                                                                        from '../utils'
import buildInitializer                                                                    from "./buildInitializer"


export function createConstructor(composedLayers) {

    function constructor(data) {
        const {compositionInstance, serviceNames} = createInstance(composedLayers)

        if (typeof data !== "object" && data != null) throw new Error('Data must be an object (not a primitive) or null')

        const setData = compositionInstance[$setData]
        if (!setData) {
            throw new Error()
        }

        setData(data)
        compositionInstance[$initializer]()

        if (IS_DEV_MODE) {
            // fixme. use own proxy to prevent sets / throw on gets
            return _wrapDataWithProxy(compositionInstance, {/* empty borrow, thus no setting */}, {isGetOnly: false})
        } else {
            return compositionInstance
        }
    }


    constructor.asService = () => {
        const {compositionInstance} = createInstance(composedLayers)

        compositionInstance[$isService] = true
        return compositionInstance
    }

    return constructor
}
