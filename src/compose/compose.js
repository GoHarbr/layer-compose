import {getLayerId, isFragmentOfLayers, isLcConstructor, isService,}                                    from "../utils"
import {
    $at,
    $composition,
    $compositionId,
    $getComposition,
    $isComposed,
    $isService,
    $layerOrder,
    $layers,
    IS_DEV_MODE
} from "../const"
import {functionComposer}                                                                               from "./functionComposer"
import makeBaseComposition                                                             from "./makeBaseComposition"
import {createConstructor}                                                             from "../constructor/createConstructor"
import {wrapFunctionForDev}                                                            from "./wrapFunctionForDev"
import {findLocationFromError}                                                         from "../external/utils/findLocationFromError"
import {markWithId}                                                                    from "./markWithId"

async function compose(layerLike, composed) {
    const layerId = getLayerId(layerLike) // can also return compositionId

    if (composed) {
        composed = Object.create(composed)

        if (composed[$layerOrder].includes(layerId)) {
            // console.debug("Layer is already present in the composition", Object.keys(layerLike))
            return composed
        } else if (layerLike[$layerOrder]) {
            for (const _lid of layerLike[$layerOrder]) {
                if (composed[$layerOrder].includes(_lid)) debugger
            }
            composed[$layerOrder] = [...composed[$layerOrder], ...layerLike[$layerOrder]]
        } else {
            composed[$layerOrder] = [...composed[$layerOrder], layerId]
        }
    }

    if (isLcConstructor(layerLike)) {

        /*
        * Processing an existing composition as a layer (taking it apart essentially and composing into this composition)
        * */

        const newLayers = await layerLike[$layers]
        if (!composed) {
            return compose(newLayers, null)
        }

        return await compose(newLayers, composed)

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
        if (!composed) {
            composed = makeBaseComposition(layerId)
        }

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
                const at = value[$at] || layerLike[$at]
                if (!at) debugger

                let composedEntry
                let fn = value
                if (IS_DEV_MODE && !fn[$isComposed]) {
                    fn = wrapFunctionForDev(layerId, fn, {
                            name: fnName,
                            at
                        })
                }

                const existing = composed[fnName] || null

                if (existing || !fn[$isComposed]) { // do not recompose!
                    composedEntry = functionComposer(existing, fn, { isReverse })
                } else {
                    composedEntry = fn
                }

                composedEntry[$isComposed] = true


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
