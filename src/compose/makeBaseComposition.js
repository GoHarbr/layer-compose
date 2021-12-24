import {$layerOrder, $layers, $lensName, $writableKeys} from "../const"

export default function () {
    return {
        [$layers]: new Map(),
        [$layerOrder]: [],
        // [$writableKeys] -- live in seal.js
    }
}
