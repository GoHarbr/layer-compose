export default function defaults(...args) {
    if (typeof args[0] == 'object' && args.length == 1) {
        return defaultsAuto(...args)
    } else {
        return defaultsManual(...args)
    }
}
function defaultsAuto(defaultValues) {
    return ($,_) => {
        defaultsManual(_, defaultValues)
    }
}
function defaultsManual(_, defaultValues) {
    for (const k of Object.keys(defaultValues)) {
        const notIn = !(k in _)

        if (notIn || _[k] == null) {

            let v = defaultValues[k]

            // no need to re-set to the same value
            if (v === null && !notIn && _[k] === null) continue;

            if (v === undefined) throw new Error(`Default value for key ${k} cannot be 'undefined'`)
            _[k] = typeof v == 'function' && v.length === 0 ? v() : v
        }
    }
}
