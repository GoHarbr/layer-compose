import {$dataPointer, $initializer, $isLc, IS_DEV_MODE} from "../const"
import {unwrapProxy}                                                                     from "../proxies/utils"
import {wrapCompositionWithProxy}                          from "../proxies/wrapCompositionWithProxy"

function setData(instance, data) {
    instance[$dataPointer] = Object.create(data || {})
}

function setDataDev(instance, data) {
    // allows for reuse of created data proxies
    // data[$dataProxyMap] = new Map()

    setData(instance, data)
}

const $setData$ = IS_DEV_MODE ? setDataDev : setData

export function createConstructor(composed) {

    function constructor(data = {}) {
        const compositionInstance = Object.create(composed)

        if (typeof data !== "object") {
            throw new Error('Data must be an object (not a primitive)')
        }

        $setData$(compositionInstance, data)
        // compositionInstance[$servicesPointer] = {}
        compositionInstance[$initializer](compositionInstance)
        return compositionInstance
    }

    let _constructor = constructor


    if (IS_DEV_MODE) {
        _constructor = data => {
            data = unwrapProxy(data)
            const i = constructor(data)
            return wrapCompositionWithProxy(i)
        }
    }

    _constructor[$isLc] = true
    _constructor.partial = (presetValues) => {
        const fn = (data = {}) => _constructor({...presetValues, ...data})
        Object.assign(fn, _constructor)
        return fn
    }

    return _constructor
}
