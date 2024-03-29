import { isFragmentOfLayers, isLcConstructor, } from "../utils"
import {
    $at,
    $compositionId,
    $getComposition,
    $isComposed,
    $isLc,
    $layerOrder,
    $layers,
    GETTER_NAMING_CONVENTION_RE,
    IS_DEV_MODE
} from "../const"
import { functionComposer } from "./functionComposer"
import makeBaseComposition from "./makeBaseComposition"
import { createConstructor } from "../constructor/createConstructor"
import { wrapFunctionForDev } from "./wrapFunctionForDev"
import { findLocationFromError } from "../utils/findLocationFromError"
import { registerLayer } from "./registerLayer"

async function compose(layerLike, composed) {
    if (layerLike[Symbol.toStringTag] === 'Module') {
        const def = layerLike.default
        if (!def) {
            throw new Error('Dynamic import must have a default export')
        }
        return compose(def, composed)
    }

    const layerId = registerLayer(layerLike) // can also return compositionId

    if (composed) {
        composed = Object.create(composed)

        if (composed[$layerOrder].includes(layerId)) {
            // console.debug("Layer is already present in the composition", Object.keys(layerLike))
            return composed
        } else {
            composed[$layerOrder] = [...composed[$layerOrder], layerId]
        }
    }

    if (isLcConstructor(layerLike)) {

        /*
        * Processing an existing composition as a layer (taking it apart essentially and composing into this composition)
        * */

        if (!composed) {
            // not to lose the reference to the composed constructor
            // important for parent()
            // return await compose(newLayers, makeBaseComposition(layerId))
            const c = await layerLike[$getComposition]()
            c[$layerOrder].push(c[$compositionId])
            return c
        }

        const newLayers = layerLike[$layers]
        return await compose(newLayers, composed)

    } else if (isFragmentOfLayers(layerLike)) {
        /*
        * The style of spec definition is
        * bottom layers (base mixins; called first) are defined after top layers (extending mixins; called last)

        *
        * However, mixins added on top, replace the same ones on the bottom
        * This allows to re-order layers
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
            const value = await layerLike[name]

            if (typeof value === 'object' || isLcConstructor(value)) {
                // if this is a service definition then it starts with a capital letter
                if (name[0] !== name[0].toUpperCase() && name[0] !== '_' && name[0] !== '$') {
                    throw new Error("Lens name must start with uppercase letter: " + name)
                }

                const serviceName = name
                const hasExisting = serviceName in composed

                let s
                if (!hasExisting && value[$isLc]) { // no need to recompose
                    s = value
                } else {
                    const serviceLayers = [value] // given that top layers are processed first, push in the opposite order
                    serviceLayers[$at] = value[$at] || layerLike[$at]

                    if (hasExisting) {
                        /*
                        * Case: second+ encounter of a Lens by this name
                        * */
                        serviceLayers.unshift(composed[serviceName]) // given that top layers are processed first, push in the opposite order
                        serviceLayers[$at] = value[$at] || layerLike[$at]

                    }

                    s = createConstructor(serviceLayers)
                }

                if (IS_DEV_MODE && !s[$layers]?.[$at]) debugger

                next[serviceName] = s

            } else if (typeof value == 'function') {
                const isGetter = GETTER_NAMING_CONVENTION_RE.test(name)

                // ! explainer: layers used to be reversed when processed as an array
                // ! that's why `isReverse` is now false for initializers and true for other functions

                // reversing in case of the foreground initializer function
                const isReverse = name !== '_'
                const isLensInitializer = name[0] === name[0].toUpperCase()

                let fnName = name
                // change name if not already prefixed
                if (isLensInitializer && !['_', '$'].includes(name[0])) fnName = '_' + fnName

                // if this is a function definition, compose
                const at = value[$at] || layerLike[$at]
                if (!at) debugger

                let composedEntry
                let fn = value

                const existing = composed[fnName] || null

                if (isGetter) {
                    if (existing) {
                        throw new Error('Getter cannot be redefined: already exists' + fnName)
                    }

                    composedEntry = ($,_) => fn(_)

                    if (IS_DEV_MODE) {
                        composedEntry = wrapFunctionForDev(layerId, composedEntry, {
                            name: fnName,
                            at,
                        })
                    }

                } else {

                    if (IS_DEV_MODE && !fn[$isComposed]) {
                        fn = wrapFunctionForDev(layerId, fn, {
                            name: fnName,
                            at
                        })
                    }

                    if (existing || !fn[$isComposed]) { // do not recompose!
                        composedEntry = functionComposer(existing, fn, { isReverse })
                    } else {
                        composedEntry = fn
                    }

                }


                composedEntry[$isComposed] = true


                next[fnName] = composedEntry
            } else {
                throw new Error('Only functions or lenses are allowed')
            }
        }

        composed[$at] = layerLike[$at]
        if (IS_DEV_MODE && !composed[$at]) debugger
        return Object.assign(composed, next)
    }
}

async function processFragmentOfLayers(layerLike, composed) {
    for (let i = 0; i < layerLike.length; i++) {
        const l = layerLike[i]

        // todo. This is rather hacky.
        //    at should already be set
        if (!l[$at] && !l[$isLc] && l[Symbol.toStringTag] !== 'Module') {
            l[$at] = layerLike[$at]
        }

        composed = await compose(l, composed)
        if (IS_DEV_MODE && !composed[$at]) debugger
    }
    composed[$at] = layerLike[$at]

    return composed
}

export default compose
