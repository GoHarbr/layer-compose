export function isIncompatibleWithProxy(what) {
    /* todo. improve this check, not fully reliable as is */
    return !!what && typeof what == "object" && (
        Array.isArray(what)
        || (Symbol.iterator in what)
        || (Symbol.asyncIterator in what)
        || what instanceof Set
        || what instanceof WeakSet
        || what instanceof Map
        || what instanceof WeakMap
        || what instanceof Promise
    )
}

const proxyTargetMap = new WeakMap()
export function TaggedProxy(target, definition) {
    const p = new Proxy(target, definition)
    const t = unwrapProxy(target)
    if (!t) {
        throw new Error("Proxy target must be defined")
    }

    proxyTargetMap.set(p, t)
    return p
}

function isProxy(p) {
    return proxyTargetMap.has(p)
}

export function unwrapProxy(p) {
    if (isProxy(p)) {
        const target = proxyTargetMap.get(p)
        return unwrapProxy(target)
    } else {
        return p
    }
}
