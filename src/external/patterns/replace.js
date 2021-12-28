import {$dataPointer, $isCompositionInstance, IS_DEV_MODE} from "../../const"

export default function replace($, replaceCoreWith) {
        if (replaceCoreWith) {
            if (replaceCoreWith[$isCompositionInstance]) throw new Error('Cannot replace _ with a Composition')
            if (Object.keys($[$dataPointer]).length) throw new Error('Cannot replace a non-empty core (_ == {} must be true)')

            $[$dataPointer] = replaceCoreWith
        } else {
            if (IS_DEV_MODE) console.warn("Replace action had no effect")
        }
}
