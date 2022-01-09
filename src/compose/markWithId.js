import {$compositionId} from "../const"

const compositionsById = {}

let _compositionId = 0 // for debug purposes
export function markWithId(composition) {
    _compositionId++
    const id = composition[$compositionId] = Symbol(_compositionId + '::composition-id')
    compositionsById[id] = composition

    return composition
}

export function getCompositionById(id) {
    return compositionsById[id]
}
