import {
    $dataPointer,
    $initializedCalls,
    $initializer,
    $isCompositionInstance,
    $isLc,
    IS_DEV_MODE
} from "../const"
import {unwrapProxy}                                                                          from "../proxies/utils"
import {wrapCompositionWithProxy}                                     from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods                                            from "./wrapStandardMethods"

export function createConstructor(composed) {

    function constructor(coreObject = {}) {
        const compositionInstance = Object.create(composed)

        if (typeof coreObject !== "object") {
            throw new Error('Data must be an object (not a primitive)')
        }

        compositionInstance[$isCompositionInstance] = true
        compositionInstance[$initializedCalls] = []
        compositionInstance[$dataPointer] = coreObject[$isCompositionInstance] ? coreObject : Object.create(coreObject || {})

        // todo. think through if extensions should be kept.
        // compositionInstance[$extendSuper] = $

        wrapStandardMethods(compositionInstance) // for methods like .then

        composed[$initializer](compositionInstance)

        return compositionInstance
    }

    let _constructor = constructor


    if (IS_DEV_MODE) {
        _constructor = (data, $) => {
            data = unwrapProxy(data)
            const i = constructor(data, $)
            return wrapCompositionWithProxy(i)
        }
    }

    _constructor[$isLc] = true
    _constructor.partial = (presetValues) => {
        const fn = (data = {}) => _constructor({ ...presetValues, ...data })
        Object.assign(fn, _constructor)
        return fn
    }

    return _constructor
}
