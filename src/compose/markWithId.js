import { $compositionId } from "../const"
import { registerLayer } from "./registerLayer"

const compositionsById = {}

let _compositionId = 0 // for debug purposes
export function markWithId(composition) {
    // const idString = numericId != null ? numericId : _compositionId++
    const idString = _compositionId++

    const id = composition[$compositionId] = Symbol(idString + '::composition-id')
    compositionsById[id] = composition

    // composition[$layerOrder].push(id)

    registerLayer(composition)

    return composition
}

export function getCompositionFromInstance($) {
    return getCompositionById($[$compositionId])
}

export function getCompositionById(id) {
    return compositionsById[id]
}
