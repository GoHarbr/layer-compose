import {
    $composition,
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
import createBinder                  from "./createBinder"
import withTransform from '../external/patterns/withTransform'
import layerCompose from '../layerCompose'

export function createConstructor(composed) {
    const bindWith = createBinder(composed)

    function constructor(coreObject = {}) {
        const compositionInstance = Object.create(composed)
        bindWith(compositionInstance) // direct mutation

        /* allow core objects to get reference to wrapping composition */
        let core
        if (typeof coreObject === "function") {
            core = coreObject(compositionInstance)
        } else {
            core = coreObject
        }

        if (typeof core !== "object") {
            throw new Error('Data must be an object (not a primitive)')
        }

        compositionInstance[$isCompositionInstance] = true
        compositionInstance[$initializedCalls] = []
        // compositionInstance[$dataPointer] = coreObject[$isCompositionInstance] ? coreObject :
        // Object.create(coreObject || {})
        compositionInstance[$dataPointer] = core

        // todo. think through if extensions should be kept.
        // compositionInstance[$extendSuper] = $

        wrapStandardMethods(compositionInstance) // for methods like .then

        composed[$initializer](compositionInstance)

        return compositionInstance
    }

    let _constructor
    if (IS_DEV_MODE) {
        _constructor = (data) => {
            data = unwrapProxy(data)
            const i = constructor(data)
            return wrapCompositionWithProxy(i)
        }
    } else {
        _constructor = constructor
    }

    _constructor[$isLc] = true
    _constructor[$composition] = composed


    /*
    * Partial can be re-implemented through hidden methods `_...`
    * or data proxy for initialization (and so can transform then)
    * */

    _constructor.partial = _constructor.withDefaults = function (presetValues) {

        return layerCompose(($, _) => {
                _(core => {
                    for (const k of Object.keys(presetValues)) {
                        if (core[k] == null) core[k] = presetValues[k]
                    }
                    return core
                })
            },
            _constructor
        )
    }

    /** Change the shape of the internal interface */
    _constructor.transform = function (transformer) {
        return withTransform(transformer, _constructor)
    }

    return _constructor
}
