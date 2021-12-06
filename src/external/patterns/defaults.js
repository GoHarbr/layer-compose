import {$isCompositionInstance, IS_DEV_MODE} from "../../const"

export default function defaults(valuesOrGenerator) {
    return ($,_) => {
        const isGenerated = typeof valuesOrGenerator == 'function'
        const defaultValues = isGenerated ? valuesOrGenerator($,_) : valuesOrGenerator

        for (const k of Object.keys(defaultValues)) {
            const notIn = !(k in _)

            if (notIn || _[k] == null) {
                if (IS_DEV_MODE) {
                    if (_[$isCompositionInstance]) {
                        console.warn("Setting a default value on an inner interface that is a composition: " + k)
                    }
                }
                let v = defaultValues[k]
                if (!!v && typeof v == "object") {
                    if (!isGenerated) {
                        throw new Error(`Raw objects are not allowed as defaults (key: ${k}). They will carry over to other instances. Use \`() => ...\` to generate them dynamically`)
                    }
                    if (IS_DEV_MODE && Object.keys(v).length) {
                        console.warn("")
                    }
                    // v = Object.create(v)
                }

                if (v === undefined) throw new Error(`Default value for key ${k} cannot be 'undefined'`)
                _[k] = v
            }
        }
    }
}
