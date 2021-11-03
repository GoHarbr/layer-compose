import {$isCompositionInstance, IS_DEV_MODE} from "../../const"

export default function assign(valuesOrGenerator) {
    return ($,_) => {
        if (_[$isCompositionInstance]) {
            console.warn("Setting a value on an inner interface that is a composition")
        }

        const values = typeof valuesOrGenerator == 'function' ? valuesOrGenerator($,_) : valuesOrGenerator

        Object.assign(_, values)
    }
}
