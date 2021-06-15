import {$isCompositionInstance, IS_DEV_MODE} from "../../const"

export default function (presetValues) {

    return ($, _) => _(core => {
        for (const k of Object.keys(presetValues)) {
            if (!(k in core) || core[k] == null) {
                if (IS_DEV_MODE) {
                    if (core[$isCompositionInstance]) console.warn("Setting a default value on an inner interface that is a composition: " + k)
                }
                let v = presetValues[k]
                if (typeof v == "function" && v.length === 0) {
                    v = v()
                    // truthy check for in case of null
                } else if (!!v && typeof v == "object") {
                    throw new Error(`Raw objects are not allowed as defaults (key: ${k}). They will carry over to other instances. Use \`() => ...\` to generate them dynamically`)
                }

                if (v === undefined) throw new Error(`Default value for key ${k} cannot be 'undefined'`)
                core[k] = v
            }
        }
        return core
    })
}
