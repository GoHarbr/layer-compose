import {
    $composition,
    $compositionId,
    $dataPointer,
    $initializedCalls,
    $initializer,
    $isCompositionInstance,
    $isLc,
    $layers,
    IS_DEV_MODE
}                                 from "../const"
import {unwrapProxy}              from "../proxies/utils"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods        from "./wrapStandardMethods"
import createBinder               from "./createBinder"
import withTransform              from '../external/patterns/withTransform'
import layerCompose               from '../layerCompose'

export function createConstructor(composed) {
    const bindWith = createBinder(composed)

    function constructor(coreObject = {}) {
        try {
            const compositionInstance = Object.create(composed)
            bindWith(compositionInstance) // direct mutation

            /* allow core objects to get reference to wrapping composition */
            let core
            if (typeof coreObject === "function") {
                core = coreObject(compositionInstance)
            } else if (coreObject == null) {
                core = {}
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
        } catch (e) {
            console.error("layerCompose encountered an error while compiling a composition:", e, e.stack)
            if (IS_DEV_MODE) throw e
        }
    }

    let _constructor
    if (IS_DEV_MODE) {
        _constructor = (data) => {
            data = unwrapProxy(data, /* unwrap composition */ false)
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
                        if (core[k] == null) {
                            let v = presetValues[k]
                            if (typeof v == "function" && v.length === 0) {
                                v = v()
                                // truthy check for in case of null
                            } else if (!!v && typeof v == "object") {
                                throw new Error(`Raw objects are not allowed as defaults (key: ${k}). They will carry over to other instances. Use \`() => ...\` to generate them dynamically`)
                            }

                            if (v === undefined) throw new Error(`Default value for key ${k} cannot be 'undefined'`)
                            core[k] = v
                        }
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
