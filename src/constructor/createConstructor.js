import {
    $composition,
    $compositionId,
    $dataPointer, $executionQueue,
    $initializedCalls,
    $initializer,
    $isCompositionInstance,
    $isLc,
    $layers, $parentComposition, $services,
    IS_DEV_MODE
}                                 from "../const"
import {unwrapProxy}              from "../proxies/utils"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods        from "./wrapStandardMethods"
import createBinder               from "./createBinder"
import withTransform              from '../external/patterns/withTransform'
import layerCompose               from '../layerCompose'
import defaults                   from "../external/patterns/defaults"
import {isPromise}                from "../utils"
import {queueForExecution} from "../compose/queueForExecution"
import constructCoreObject from "./constructCoreObject"

export function createConstructor(composed) {
    const bindWith = createBinder(composed)

    const constructor = function (coreObject, {initializer} = {}) {
        try {
            const compositionInstance = Object.create(composed)
            // binding `this` into each function
            bindWith(compositionInstance) // direct mutation

            compositionInstance[$isCompositionInstance] = true
            // @deprecated
            compositionInstance[$initializedCalls] = []
            compositionInstance[$services] = {} // where initializes services are stored
            compositionInstance[$executionQueue] = []

            const core = constructCoreObject(coreObject, compositionInstance)
            compositionInstance[$dataPointer] = core

            /* Handling promises as core objects */
            if (isPromise(core)) {
                compositionInstance[$dataPointer] = null
                queueForExecution(compositionInstance, () => core, res => {
                    if (typeof core !== "object") {
                        throw new Error('Data must be an object (not a primitive)')
                    }

                    compositionInstance[$dataPointer] = constructCoreObject(res, compositionInstance)
                })
            }

            wrapStandardMethods(compositionInstance) // for methods like .then

            if (initializer) initializer(compositionInstance)
            composed[$initializer](compositionInstance)

            return compositionInstance
        } catch (e) {
            console.error("layerCompose encountered an error while compiling a composition:", e, e.stack)
            if (IS_DEV_MODE) throw e
        }
    }

    let _constructor
    if (IS_DEV_MODE) {
        _constructor = (data, ...args) => {
            data = unwrapProxy(data, /* unwrap composition */ false)
            const i = constructor(data, ...args)

            const pc = i[$parentComposition]
            if (pc !== undefined && !pc[$isCompositionInstance]) {
                throw new Error("Parent composition must be an instance of a composition")
            }
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

        return layerCompose(
            defaults(presetValues),
            _constructor
        )
    }

    /** Change the shape of the internal interface */
    _constructor.transform = function (transformer) {
        return withTransform(transformer, _constructor)
    }

    _constructor.is = function (what) {
        let layers
        if (what[$composition]) {
            layers = what[$composition][$layers]
        } else if (what[$layers]) {
            layers = what[$layers]
        }
        return layers && layers.has(composed[$compositionId])
    }

    return _constructor
}
