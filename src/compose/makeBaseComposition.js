import {$layerOrder, $layers, $lensName, $writableKeys} from "../const"

export default function () {
    return Object.assign(Object.create(null), {
        [$layers]: new Map(),
        [$layerOrder]: [],
        // [$writableKeys] -- live in seal.js
    })
}
