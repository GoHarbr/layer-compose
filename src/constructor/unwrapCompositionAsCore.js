import {$executionQueue, $isCompositionInstance, $lensName, $parentInstance} from "../const"
import {queueForExecution} from "../compose/queueForExecution"
import core, {core_unsafe} from "../external/patterns/core"
import parent from "../external/patterns/parent"
import {GLOBAL_DEBUG}      from "../external/utils/enableDebug"
import {isExtensionOf}                                                       from "../external/patterns/isExtensionOf"

export function unwrapCompositionAsCore(proposedCore, composition) {
    if (proposedCore[$isCompositionInstance]) {
        let $ = proposedCore

        if (!isExtensionOf($, composition)) {
            $ = parent($, composition)
        }

        // extract the core once all queued operations are done
        return new Promise(resolve =>
            queueForExecution($, () => {
                const c = core_unsafe($)

                // const c = Object.assign({}, core_unsafe($))
                // c[$parentInstance] = null
                // c[$executionQueue] = null

                if (c.__debug || GLOBAL_DEBUG.enabled) {
                    const lensName = proposedCore[$lensName]
                    console.debug(`${lensName.padEnd(50)} :extract: ${Object.keys(c)}`)
                }

                resolve(c)
            }, null, {push: true}))
    } else {
        return proposedCore
    }
}
