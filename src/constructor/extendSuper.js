import {IS_DEV_MODE} from "../const"
import {isFunction} from '../utils'

function extendSuper_prod($, extendWith) {
    // todo, in dev mode watch for clashes
    if (extendWith) {
        for (const k in extendWith) {
            if ($[k] === undefined) {
                const fn = extendWith[k]
                // if (!(fn[$isLc] || fn[$isService])) {
                if (isFunction(fn)) {
                    $[k] = fn.bind(extendWith)
                }
            }
        }
    }
}

function extendSuper_dev($, extendWith) {
    // todo, in dev mode watch for clashes
    return extendSuper_prod($, extendWith)
}

export default (IS_DEV_MODE ? extendSuper_dev : extendSuper_prod)
