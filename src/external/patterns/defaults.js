import {IS_DEV_MODE} from "../../const"

export default function defaults(_, defaultValues) {
    for (const k of Object.keys(defaultValues)) {
        const notIn = !(k in _)

        if (notIn || _[k] == null) {

            let v = defaultValues[k]

            if (!!v && typeof v == "object") {
                if (IS_DEV_MODE && Object.keys(v).length) {
                    console.warn("")
                }
            }

            if (v === undefined) throw new Error(`Default value for key ${k} cannot be 'undefined'`)
            _[k] = v
        }
    }
}
