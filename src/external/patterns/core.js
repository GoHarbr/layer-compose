import {$dataPointer, IS_DEV_MODE} from "../../const"
import {wrapDataWithProxy}         from "../../data/wrapDataWithProxy"

export default function (instance) {
    if (IS_DEV_MODE) {
        return instance[$dataPointer]
    } else {
        return wrapDataWithProxy(null, instance[$dataPointer])
    }
}

export function core_unsafe(instance) {
    return instance[$dataPointer]
}
