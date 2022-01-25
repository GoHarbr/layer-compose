import {$dataPointer, IS_DEV_MODE} from "../../const"
import {wrapDataWithProxy}         from "../../data/wrapDataWithProxy"

export default function (instance, layerId = null) {
    const core = instance[$dataPointer] || instance // for cases when core is applied to a non-instance
    if (IS_DEV_MODE) {
        return wrapDataWithProxy(layerId, core)
    } else {
        return core
    }
}

export function core_unsafe(instance) {
    return instance[$dataPointer]
}
