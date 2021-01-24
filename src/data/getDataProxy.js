import {$dataProxyMap}     from "../const"
import {wrapDataWithProxy} from "./wrapDataWithProxy"

export function getDataProxy(layerId, data) {
    let p = data[$dataProxyMap].get(layerId)
    if (!p) {
        p = wrapDataWithProxy(layerId, data)
        data[$dataProxyMap].set(layerId, p)
    }
    return p
}
