
export function isIncompatibleWithProxy(target, prop) {
    /* todo. improve this check, not fully reliable as is */
    return !!target && typeof target == "object" && (
        Array.isArray(target)
        || prop === "hasOwnProperty"
        || (Symbol.iterator in target)
        || (Symbol.asyncIterator in target)
        || (prop === Symbol.iterator)
        || (prop === Symbol.asyncIterator)
        || target instanceof Set
        || target instanceof WeakSet
        || target instanceof Map
        || target instanceof WeakMap
        || target instanceof Promise
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

export function unwrapProxyDeep(p) {
    while(isProxy(p)) {
        p = unwrapProxy(p)
    }
    return p
}

export function unwrapProxy(p) {
    if (isProxy(p)) {
        const target = proxyTargetMap.get(p)
        return unwrapProxy(target)
    } else {
        return p
    }
}
