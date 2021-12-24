import {getLayerId, isFragmentOfLayers, isLcConstructor, isService,}                                 from "../utils"
import {$at, $composition, $compositionId, $isService, $layerOrder, $layers, $lensName, IS_DEV_MODE} from "../const"
import transformToStandardArgs                                                                       from "./transformToStandardArgs"
import {functionComposer}                                                                            from "./functionComposer"
import {getDataProxy}                                                                                from "../data/getDataProxy"
import {wrapCompositionWithProxy}                                                                    from "../proxies/wrapCompositionWithProxy"
import makeBaseComposition                                                                           from "./makeBaseComposition"
import {createConstructor}                                                                           from "../constructor/createConstructor"
import {printLocationFromError}                                                                      from "../external/utils/printLocationFromError"
import {GLOBAL_DEBUG}                                                                                from "../external/utils/enableDebug"
import {isProxy}                                                                                     from "../proxies/utils"

async function compose(layerLike, composed) {
    if (!composed) composed = makeBaseComposition()
    const layerId = getLayerId(layerLike) // can also return compositionId

    const existingLayers = composed[$layers] || (composed[$layers] = (isService(composed) && new Map()))
    if (existingLayers.has(layerId)) {
        // console.debug("Layer is already present in the composition", Object.keys(layerLike))
        return composed
    } else {
        existingLayers.set(layerId, layerLike)

        const order = composed[$layerOrder] || (composed[$layerOrder] = [])
        order.push(layerId)
    }

    if (isLcConstructor(layerLike)) {

        /*
        * Processing an existing composition as a layer (taking it apart essentially and composing into this composition)
        * */

        const existingComposition = layerLike[$composition]
        let composition
        if (existingComposition) {
            composition = existingComposition
        } else {
            composition = (layerLike[$composition] = await compose(layerLike[$layers], null))
            composition[$at] = layerLike[$at] || layerLike[$layers][$at]
        }
        // return await compose(composition, composed)
        return composition

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
                serviceLayers[$at] = value[$at] || layerLike[$at]

                if (serviceName in composed) {
                    /*
                    * Case: second+ encounter of a Lens by this name
                    * */
                    serviceLayers.push(composed[serviceName])
                }

                const s = createConstructor(serviceLayers)
                s[$isService] = true

                if (IS_DEV_MODE && !s[$layers]?.[$at]) debugger

                next[serviceName] = s

            } else if (typeof value == 'function') {

                // reversing in case of the foreground initializer function
                const isReverse = name === '_'

                // if this is a function definition, compose
                let composedEntry
                const fn = transformToStandardArgs(value)

                const existing = composed[name] || null
                if (IS_DEV_MODE) {
                    const at = value[$at] || layerLike[$at]
                    if (!at) debugger

                    composedEntry = functionComposer(existing,
                        wrapFunctionForDev(layerId, fn, {
                            name,
                            at
                        }),
                        {isReverse})
                } else {
                    composedEntry = functionComposer(existing, fn,{isReverse})
                }

                next[name] = composedEntry
            } else {
                throw new Error('Only functions or lenses are allowed')
            }
        }

        composed[$at] = layerLike[$at]
        if (IS_DEV_MODE && !composed[$at]) debugger
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
        if (!l[$at]) l[$at] = layerLike[$at]

        composed = await compose(l, composed)
        if (IS_DEV_MODE && !composed[$at]) debugger
    }
    composed[$at] = layerLike[$at]

    return composed
}

function wrapFunctionForDev(layerId, fn, {name, at}) {
    return function ($, _, opt) {
        const __ = getDataProxy(layerId, _)
        const $$ = wrapCompositionWithProxy($)

        if (isProxy(_)) debugger
        try {
            _.__debug
        } catch (e) {
            debugger
        }
        if (GLOBAL_DEBUG.enabled || 'debug' in _ && _.__debug) {
            const header = `.    ${$$[$lensName] || ''}.${name}`
            console.debug(`${header.padEnd(50)} :: ${printLocationFromError(at)}`)
        }

        // todo. wrap opt in proxy as well

        return fn($$, __, opt)
    }
}

export default compose
