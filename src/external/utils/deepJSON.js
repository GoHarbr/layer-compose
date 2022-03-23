import core from "../patterns/core.js"
import { $isCompositionInstance } from "../../const.js"

export function deepJSON(what, options = {
    resolveCircularReferencesWith: false,
    resolveFunctionReferencesWith: false
}, seen = new Set()) {
    if (!what) return what // null, undefined, empty strings, 0

    const t = typeof what

    // if not an object
    if (t != 'object' && !what?.[$isCompositionInstance]) {
        // and not an instance
        if (t == 'function') {
            if (!options.resolveFunctionReferencesWith) {
                throw new ReferenceError('References to functions cannot be serialized without `resolveFunctionReferencesWith`')
            }
            return options.resolveFunctionReferencesWith(what)
        }

        // return it as is
        return what
    }

    if (seen.has(what)) {
        if (!options.resolveCircularReferencesWith) {
            const e = new ReferenceError('Circular references cannot be resolved without `resolveCircularReferencesWith`')
            e.failedOn = v
            throw e
        }
        return options.resolveCircularReferencesWith(what)
    } else {
        seen.add(what)
    }

    const coreJson = what?.[$isCompositionInstance] ? ("_JSON" in what ? what._JSON : core(what)) : what

    const convertedJson = {}
    for (const [k, v] of Object.entries(coreJson)) {
        if (Array.isArray(v)) {
            convertedJson[k] = v.map(e => deepJSON(e, options, seen))
        } else {
            convertedJson[k] = deepJSON(v, options, seen)
        }
    }

    return convertedJson
}
