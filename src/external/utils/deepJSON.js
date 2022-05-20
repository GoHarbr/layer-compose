import core from "../patterns/core.js"
import { $isCompositionInstance } from "../../const.js"

export function deepJSON(what, options = {
    resolveCircularReferencesWith: false,
    resolveFunctionReferencesWith: false,
    alwaysUseCore: false,
    accessors: ['_JSON'],
    storeLensNames: false
}, seen = []) {
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

    if (seen.includes(what)) {
        if (!options.resolveCircularReferencesWith) {
            const e = new ReferenceError('Circular references cannot be resolved without `resolveCircularReferencesWith`')
            e.failedOn = what
            throw e
        }
        return options.resolveCircularReferencesWith(what)
    } else {
        seen = [what, ...seen]
    }

    let coreJson
    if (what?.[$isCompositionInstance]) {
        if (options.alwaysUseCore) {
            coreJson = core(what)
        } else {
            const a = options.accessors.find(a => a in what)
            coreJson = a ? what[a] : core(what)
        }
    } else {
        coreJson = what
    }

    const convertedJson = {}
    // if (options.storeLensNames && what?.[$isCompositionInstance]) {
    //     convertedJson.__lens = what[$lensName]
    // }
    for (const [k, v] of Object.entries(coreJson)) {
        if (Array.isArray(v)) {
            convertedJson[k] = v.map(e => deepJSON(e, options, seen))
        } else {
            convertedJson[k] = deepJSON(v, options, seen)
        }
    }

    return convertedJson
}
