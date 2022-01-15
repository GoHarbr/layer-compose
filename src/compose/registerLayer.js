import {getLayerId} from "../utils"

const registry = {}

export function registerLayer(layer) {
    const id = getLayerId(layer)
    registry[id] = layer

    return id
}

export function retrieveLayer(id) {
    return registry[id]
}
