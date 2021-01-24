import {TaggedProxy}     from "../proxies/utils"
import {borrowProxy}     from "../proxies/borrowProxy"

export function wrapDataWithProxy(layerId, data) {
    if (typeof layerId !== "symbol") throw new Error()

    if (typeof data === 'object') {
            return TaggedProxy(data, borrowProxy(layerId))
    } else {
        return data
    }
}
