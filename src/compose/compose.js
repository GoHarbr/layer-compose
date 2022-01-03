import {getLayerId, isFragmentOfLayers, isLcConstructor, isService,}                                   from "../utils"
import {$at, $composition, $compositionId, $isComposed, $isService, $layerOrder, $layers, IS_DEV_MODE} from "../const"
import {functionComposer}                                                                              from "./functionComposer"
import makeBaseComposition                                                                from "./makeBaseComposition"
import {createConstructor}                                                                from "../constructor/createConstructor"
import {wrapFunctionForDev}                                                               from "./wrapFunctionForDev"
import {findLocationFromError}                                                            from "../external/utils/findLocationFromError"

async function compose(layerLike, composed) {
    if (!composed) {
        composed = makeBaseComposition()
    } else {
        composed = Object.create(composed)
    }

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

        const existingComposition = await layerLike[$composition]
        let composition
        if (existingComposition) {
            composition = compose(existingComposition, composed)
        } else {
            composition = (layerLike[$composition] = compose(layerLike[$layers], composed))
            composition[$at] = layerLike[$layers][$at] || layerLike[$at]
        }
        return await composition

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

        const defaultExport = isModule && asyncRes.default
        if (isModule && !defaultExport) {
            let at = ''
            if (layerLike[$at]) {
                at = findLocationFromError(layerLike[$at])
            }
            throw new Error('Layer import() must have a default export: ' + at)
        }

        return await compose(defaultExport || asyncRes, composed)
    } else {

        // todo. make sure getters and setters aren't overwriting services

        // const _loc = splitLocationIntoComponents(findLocationFromError(layerLike[$at]))
        // console.debug(`MM ${_loc.filename}:${_loc.line}`)

        const next = {}

        for (const name in layerLike) {
            // console.log('\t', name)
            const value = layerLike[name]

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
                // todo. no need to re-wrap in a constructor again (but keep the isService flag off the original)
                // else if (isLcConstructor(value)) {
                //     return value
                // }

                const s = createConstructor(serviceLayers)
                s[$isService] = true

                if (IS_DEV_MODE && !s[$layers]?.[$at]) debugger

                next[serviceName] = s

            } else if (typeof value == 'function') {

                // reversing in case of the foreground initializer function
                const isReverse = name === '_'
                const isLensInitializer = name[0] === name[0].toUpperCase()

                let fnName = name
                // change name if not already prefixed
                if (isLensInitializer && !['_', '$'].includes(name[0])) fnName = '_' + fnName

                // if this is a function definition, compose
                let composedEntry
                const fn = value

                const existing = composed[fnName] || null

                if (existing || !fn[$isComposed]) { // do not recompose!
                    if (IS_DEV_MODE) {
                        const at = value[$at] || layerLike[$at]
                        if (!at) debugger

                        composedEntry = functionComposer(existing,
                            wrapFunctionForDev(layerId, fn, {
                                name: fnName,
                                at
                            }),
                            { isReverse })
                    } else {
                        composedEntry = functionComposer(existing, fn, { isReverse })
                    }

                    composedEntry[$isComposed] = true
                } else {
                    composedEntry = fn
                }

                next[fnName] = composedEntry
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

export default compose
