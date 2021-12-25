import {getDataProxy}             from "../data/getDataProxy"
import {wrapCompositionWithProxy} from "../proxies/wrapCompositionWithProxy"
import {isProxy}                  from "../proxies/utils"
import {GLOBAL_DEBUG}             from "../external/utils/enableDebug"
import {$lensName}                from "../const"
import {findLocationFromError}    from "../external/utils/findLocationFromError"
import {trackTypes}               from "../auto-type/trackTypes"

export function wrapFunctionForDev(layerId, fn, { name, at }) {
    return function ($, _, opt) {
        trackTypes({$,_,opt,name,at})

        if (isProxy(_)) debugger

        const __ = getDataProxy(layerId, _)
        const $$ = wrapCompositionWithProxy($)

        try {
            _.__debug
        } catch (e) {
            debugger
        }
        if (GLOBAL_DEBUG.enabled || 'debug' in _ && _.__debug) {
            const header = `.    ${$$[$lensName] || ''}.${name}`
            console.debug(`${header.padEnd(50)} :: ${findLocationFromError(at)}`)
        }

        // todo. wrap opt in proxy as well

        return fn($$, __, opt)
    }
}
