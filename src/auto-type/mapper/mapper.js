import { retrieveLayer } from "../../compose/registerLayer"
import { $at, $composition, $layerOrder } from "../../const"
import { Card } from "./html-elems"
import { getFunctionDetails } from "./getFunctionDetails"

export const functionCallsByName = {}


function addRecord(cname, fnName, layerIds, at) {
    cname = cname || ''
    const record = functionCallsByName[cname] = functionCallsByName[cname] || []

    record.push({ fnName, layerIds, at })
}

export function trackExternalFunctionCall(fullyQualifiedName, functionName, compositionId, at) {
    const layer = retrieveLayer(compositionId) // should be pointing to the constructor
    const layerIds = layer[$composition][$layerOrder]

    addRecord(fullyQualifiedName, functionName, layerIds, at)
}

const __functions = Symbol('functions')
const __layers = Symbol('layers')
const __meta = Symbol('meta')

export function generateMapTree(functionCallsByName) {
    const mapTree = {}

    const distinctCompositionChains = Object.keys(functionCallsByName)
    for (const compositionFqName of distinctCompositionChains) {
        // path from fully qualified name (lens.lens.lens ...)
        const pathFragments = compositionFqName.split('.')

        let pointer = ''
        let branch = mapTree
        for (let i = 0; i < pathFragments.length; i++) {
            const fragment = pathFragments[i]
            pointer += "." + fragment
            branch = branch[fragment] = branch[fragment] || {
                [__meta]: {
                    pointer
                },
                [__functions]: {},
                [__layers]: []
            }
        }

        const logOfCalls = functionCallsByName[compositionFqName]

        // updating the map through `branch`
        const distinctFunctions = branch[__functions]
        const distinctLayers = branch[__layers]
        for (const record of logOfCalls) {
            const { fnName, layerIds, at } = record

            // const fns = distinctFunctions[fnName] || (distinctFunctions[fnName] = [])

            distinctFunctions[fnName] || (distinctFunctions[fnName] = [])

            // adding actual code definitions here
            // fns.push(getFunctionFromError(fnName, at, pathFragments))

            layerIds.forEach(l => !distinctLayers.includes(l) && distinctLayers.push(l))
        }

        for (const l of distinctLayers) {
            const layer = retrieveLayer(l)

            for (const fnName of Object.keys(distinctFunctions)) {
                const details = getFunctionDetails(fnName, layer[$at], pathFragments)
                distinctFunctions[fnName].push(
                    { ...details, layerId: l.toString(), name: fnName }
                )
            }
        }

    }

    return mapTree
}

export function generateMapCard(subtree) {
    const cards = []

    for (const [name, v] of Object.entries(subtree)) {
        const layers = Array.from(v[__layers]).map(retrieveLayer).map(l => l[$composition] || l)

        const title = { segments: v[__meta].pointer.split('.') }
        const card = Card(title, layers, v[__functions], generateMapCard(v))
        cards.push(card)
    }

    return cards.join('')
}

