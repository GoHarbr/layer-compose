import {$dataPointer, $isCompositionInstance, IS_DEV_MODE} from "../../const"
import {isPromise}                                         from "../../utils"
import {queueForExecution}                                 from "../../compose/queueForExecution"

export default function replace($, replaceCoreWith) {
        if (replaceCoreWith) {
            if (Object.keys($[$dataPointer]).length) throw new Error('Cannot replace a non-empty core (_ == {} must be true)')

            if (isPromise(replaceCoreWith)) {
                queueForExecution($, () => replaceCoreWith.then(r => replace($, r)))
            } else {
                if (replaceCoreWith[$isCompositionInstance]) {

                } else {
                    $[$dataPointer] = replaceCoreWith
                }
            }
        } else {
            if (IS_DEV_MODE) console.warn("`setCore` action had no effect because the core is empty")
        }
}
