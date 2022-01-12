import {TaggedProxy}     from "../proxies/utils"
import {borrowProxy}     from "../proxies/borrowProxy"

export function wrapDataWithProxy(layerId, data) {
    // nulls are allowed when exposing for reading only
    if ((typeof layerId !== "symbol") && layerId !== null) throw new Error()

    if (typeof data === 'object') {
            return TaggedProxy(data, borrowProxy(layerId))
    } else {
        return data
    }
}
