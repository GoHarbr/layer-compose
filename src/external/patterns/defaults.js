import {IS_DEV_MODE} from "../../const"

export default function defaults(_, defaultValues) {
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
