import { $traceId } from "../../const"

export function isSameInstance(one, other) {
    const id1 = one[$traceId]
    const id2 =   other[$traceId]
    return id1 != null && id2 != null && id1 === id2
}
