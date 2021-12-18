import {getLayerId, isFragmentOfLayers, isLcConstructor,}                                       from "../utils"
import {$composition, $compositionId, $isService, $layerOrder, $layers, $lensName, IS_DEV_MODE} from "../const"
import transformToStandardArgs                                                                  from "./transformToStandardArgs"
import {functionComposer}                                                            from "./functionComposer"
import {getDataProxy}                                                                from "../data/getDataProxy"
import {wrapCompositionWithProxy}                                                    from "../proxies/wrapCompositionWithProxy"
import makeBaseComposition                                                           from "./makeBaseComposition"

async function compose(layerLike, composed) {
    if (!composed) composed = makeBaseComposition()
    const layerId = getLayerId(layerLike) // can also return compositionId

    if (composed[$layers].has(layerId)) {
        // console.debug("Layer is already present in the composition", Object.keys(layerLike))
        return composed
    } else {
        composed[$layers].set(layerId, layerLike)
        composed[$layerOrder].push(layerId)
    }

    if (isLcConstructor(layerLike)) {

        /*
        * Processing an existing composition as a layer (taking it apart essentially and composing into this composition)
        * */

        const layers = layerLike[$layers]
        return await processFragmentOfLayers(layers, composed, /* in given order */ true)

    } else if (isFragmentOfLayers(layerLike)) {
        /*
        * The style of spec definition is
        * bottom layers (base mixins; called first) are defined after top layers (extending mixins; called last)
        * */
        return await processFragmentOfLayers(layerLike, composed)

    } else if (typeof layerLike.then == 'function') {
        /*
        * Async imports
        * */
        const asyncRes = await layerLike
        const isModule = asyncRes.__esModule || asyncRes[Symbol.toStringTag] === 'Module'

        return await compose(isModule ? asyncRes.default : asyncRes, composed)
    } else {

        // todo. make sure getters and setters aren't overwriting services

        const next = {}

        for (const [name, value] of Object.entries(layerLike)) {
            if (typeof value === 'object' || isLcConstructor(value)) {
                // if this is a service definition then it starts with a capital letter
                if (name[0] !== name[0].toUpperCase()) {
                    throw new Error("Lens name must start with uppercase: " + name)
                }

                const serviceName = name
                const serviceLayers = [value]

                if (serviceName in composed) {
                    /*
                    * Case: second+ encounter of a Lens by this name
                    * */
                    serviceLayers.push(composed[serviceName])
                }

                next[serviceName] = await compose(serviceLayers,
                    {
                        [$isService]: true,
                        [$lensName]: name
                    })

            } else if (typeof value == 'function') {

                // reversing in case of the foreground initializer function
                const fnC = name === '_' ? (existing, next) => functionComposer(next, existing) : functionComposer

                // if this is a function definition, compose
                let composedEntry
                const fn = transformToStandardArgs(value)

                const existing = composed[name] || null
                if (IS_DEV_MODE) {
                    composedEntry = fnC(existing, wrapFunctionForDev(layerId, fn))
                } else {
                    composedEntry = fnC(existing, fn)
                }

                next[name] = composedEntry
            } else {
                throw new Error('Only functions or lenses are allowed')
            }
        }

        return markWithId(Object.assign(composed, next))
    }
}

let _compositionId = 0 // for debug purposes
function markWithId(composition) {
    _compositionId++
    composition[$compositionId] = Symbol(_compositionId + '::composition-id')
    return composition
}

async function processFragmentOfLayers(layerLike, composed, inGivenOrder = false) {
    if (inGivenOrder) {
        layerLike.reverse()
    }

    for (let i = layerLike.length; i--; i >= 0) {
        const l = layerLike[i]
        composed = await compose(l, composed)
    }
    return composed
}

function wrapFunctionForDev(layerId, fn) {
    return function ($, _, opt) {
        const __ = getDataProxy(layerId, _)
        const $$ = wrapCompositionWithProxy($)

        // todo. wrap opt in proxy as well

        return fn($$, __, opt)
    }
}

export default compose
