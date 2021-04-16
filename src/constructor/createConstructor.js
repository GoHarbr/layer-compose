import {
    $dataPointer,
    $initializedCalls,
    $initializer,
    $isCompositionInstance,
    $isLc,
    IS_DEV_MODE
}                                 from "../const"
import {unwrapProxy}              from "../proxies/utils"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods        from "./wrapStandardMethods"
import createBinder               from "./createBinder"

export function createConstructor(composed) {
    const bindWith = createBinder(composed)

    function constructor(coreObject = {}) {
        const compositionInstance = Object.create(composed)
        bindWith(compositionInstance) // direct mutation

        if (typeof coreObject !== "object") {
            throw new Error('Data must be an object (not a primitive)')
        }

        compositionInstance[$isCompositionInstance] = true
        compositionInstance[$initializedCalls] = []
        // compositionInstance[$dataPointer] = coreObject[$isCompositionInstance] ? coreObject : Object.create(coreObject || {})
        compositionInstance[$dataPointer] = coreObject

        // todo. think through if extensions should be kept.
        // compositionInstance[$extendSuper] = $

        wrapStandardMethods(compositionInstance) // for methods like .then

        composed[$initializer](compositionInstance)

        return compositionInstance
    }

    let _constructor = constructor
    _constructor[$isLc] = true


    if (IS_DEV_MODE) {
        _constructor = (data, $) => {
            data = unwrapProxy(data)
            const i = constructor(data, $)
            return wrapCompositionWithProxy(i)
        }
    }

    _constructor.partial = function (presetValues) {
        /*
        * Todo. These are lost during layering. Feature or bug?
        * */
        const _this = this
        const fn = (core = {}) => {
            for (const k of Object.keys(presetValues)) {
                if (core[k] === undefined) core[k] = presetValues[k]
            }
            return _this(core)
        }
        return Object.assign(fn, _this)
        // return fn
    }

    _constructor.transform = function (transformer, postTransform) {
        const _this = this

        const fn = (core) => {
            const t = transformer(core)
            const c = _this(t)
            if (postTransform) postTransform(c, t)
            return c
        }
        return Object.assign(fn, _this)
        // return fn
    }

    _constructor.wrap = function (wrapWith) {

    }

    return _constructor
}
