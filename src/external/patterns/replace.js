import {$dataPointer, $isCompositionInstance, IS_DEV_MODE} from "../../const"

export default function replace(valuesOrGenerator) {
    return ($, _) => {

        const values = typeof valuesOrGenerator == 'function' ? valuesOrGenerator($, _) : valuesOrGenerator

        if (values) {
            $[$dataPointer] = values
        } else {
            if (IS_DEV_MODE) console.warn("Replace action had no effect")
        }
    }
}
