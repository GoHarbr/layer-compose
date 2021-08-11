import {$isCompositionInstance, IS_DEV_MODE} from "../../const"

/**
 *
 * @param overwriteToPojo if the inner interface is not a POJO, overwrite it to be
 * */
export default function (presetValues, overwriteToPojo = false) {

    return ($, _) => _(initialCore => {
        let core = overwriteToPojo && initialCore[$isCompositionInstance] ? {} : initialCore

        for (const k of Object.keys(presetValues)) {
            const notIn = !(k in core)

            if (notIn || core[k] == null) {
                if (IS_DEV_MODE) {
                    if (core[$isCompositionInstance]) {
                        console.warn("Setting a default value on an inner interface that is a composition: " + k)
                    }
                }
                let v = presetValues[k]
                if (typeof v == "function" && v.length === 0) {
                    v = v(initialCore)
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
