import { getDataProxy } from "../data/getDataProxy"
import { wrapCompositionWithProxy } from "../proxies/wrapCompositionWithProxy"
import { isProxy } from "../proxies/utils"
import { GLOBAL_DEBUG } from "../utils/enableDebug"
import { $fullyQualifiedName, $tag, $traceId } from "../const"
import { findLocationFromError } from "../utils/findLocationFromError"
import { trackTypes } from "../diagrams/__old/trackTypes"

export function wrapFunctionForDev(layerId, fn, { name, at }) {
    return function ($, _, opt) {
        trackTypes({$,_,opt,name,at})

        if (isProxy(_)) debugger

        const __ = getDataProxy(layerId, _)
        const $$ = wrapCompositionWithProxy($, layerId)

        if (GLOBAL_DEBUG.enabled) {
            const header = `.    ${name.padEnd(25)}  ${$[$fullyQualifiedName] || $[$tag] || ''} [${$[$traceId].toString() || ''}]`
            console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at)}`)
        }

        // todo. wrap opt in proxy as well

        return fn($$, __, opt)
    }
}
