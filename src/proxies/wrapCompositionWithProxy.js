import {TaggedProxy}      from "./utils"
import {definedGetProxy}  from "./proxies"
import {noSetAccessProxy} from "./noSetAccessProxy"

export function wrapCompositionWithProxy(c) {
    const pdef = {
        ...noSetAccessProxy,
        get(t,p) {
            return definedGetProxy._get(t,p, pdef)
        },
    }
    return TaggedProxy(c, pdef)
}
