import {$composition, $compositionId, $dataPointer, $isCompositionInstance, $isLc, $layers, IS_DEV_MODE} from "../const"
import {wrapCompositionWithProxy}                                                                        from "../proxies/wrapCompositionWithProxy"
import wrapStandardMethods
                                                                                                         from "./wrapStandardMethods"
import constructCoreObject
                                                                                                         from "./constructCoreObject"
import compose
                                                                                                         from "../compose/compose"
import seal                                                                                              from "./seal"
import initialize
                                                                                                         from "./initialize"

export function createConstructor(layers) {


    const _c = _constructor(layers)
    const constructor = _c.bind(_c)
    constructor[$isLc] = true
    constructor[$layers] = layers

    constructor.is = function (what) {
        let layers
        if (what[$composition]) {
            layers = what[$composition][$layers]
        } else if (what[$layers]) {
            layers = what[$layers]
        }
        return layers && layers.has(composed[$compositionId])
    }

    return constructor
}

export async function constructFromComposition(composition, coreObject) {
    const compositionInstance = seal(composition, Object.create(null))
    compositionInstance[$isCompositionInstance] = true

    compositionInstance[$dataPointer] = await constructCoreObject(coreObject, compositionInstance)

    wrapStandardMethods(compositionInstance) // for methods like .then
    initialize(compositionInstance)


    if (IS_DEV_MODE) {
        Object.freeze(compositionInstance)
        return [wrapCompositionWithProxy(compositionInstance)]
    } else {
        return [compositionInstance]
    }

}

const _constructor = (layers) => async function (coreObject, cb) {
    try {
        // taking stored or composing for the first time
        const composition = this[$composition] = (this[$composition] || await compose(layers, null))
        const [$] = await constructFromComposition(composition, coreObject)

        cb($)

    } catch (e) {
        console.error("layerCompose encountered an error while constructing a composition:", e, e.stack)
        if (IS_DEV_MODE) throw e
    }
}
