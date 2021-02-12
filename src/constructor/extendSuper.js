import {IS_DEV_MODE}   from "../const"
import {isFunction}    from '../utils'
import {combineResult} from "../compose/combineResult"

function extendSuper_prod($, extendWith) {
    // todo, in dev mode watch for clashes
    if (extendWith) {
        for (const k in extendWith) {
            const fn = extendWith[k]
            if (isFunction(fn)) {
                const $k = $[k]
                if ($k === undefined) {
                    $[k] = fn.bind(extendWith)
                } else {
                    $[k] = (opt) => {
                        const isAsync = $k.isAsync || fn.isAsync
                        return combineResult(fn.call(extendWith, opt), $k.call($, opt), isAsync)
                    }
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
