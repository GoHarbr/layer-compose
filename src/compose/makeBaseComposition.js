import {$layerOrder, $layers, $lensName, $writableKeys} from "../const"

export default function (creatorId) {
    // const layers = new Map()
    // layers.set(creatorId, creatorDefinition)

    return Object.assign(Object.create(null), {
        // [$layers]: layers,
        [$layerOrder]: [creatorId],
        // [$writableKeys] -- live in seal.js
    })
}
