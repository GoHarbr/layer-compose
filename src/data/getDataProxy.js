import {$dataProxyMap}     from "../const"
import {wrapDataWithProxy} from "./wrapDataWithProxy"

export function getDataProxy(layerId, data) {
    if (!data.hasOwnProperty($dataProxyMap)) data[$dataProxyMap] = new Map()

    let p = data[$dataProxyMap].get(layerId)
    if (!p) {
        p = wrapDataWithProxy(layerId, data)
        data[$dataProxyMap].set(layerId, p)
    }
    return p
}
