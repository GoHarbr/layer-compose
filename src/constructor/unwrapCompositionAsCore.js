import { $executionQueue, $isCompositionInstance, $lensName, $parentInstance, IS_DEV_MODE } from "../const"
import { queueForExecution } from "../execution/queueForExecution"
import { core_unsafe } from "../external/patterns/core"
import { GLOBAL_DEBUG } from "../utils/enableDebug"
import { isExtensionOf } from "../external/patterns/isExtensionOf"
import { unwrapProxy } from "../proxies/utils"

export function unwrapCompositionAsCore(proposedCore, composition) {
    if (proposedCore[$isCompositionInstance]) {
        let $ = proposedCore

        if (!isExtensionOf($, composition)) {
            // $ = parent($, composition)
            throw new Error("At the moment, a composition can only re-wrap its own type")
        }

        // extract the core once all queued operations are done
        return new Promise(resolve =>
            queueForExecution($, () => {
                // const c = core_unsafe($)

                const c = Object.assign({}, core_unsafe($))
                c[$parentInstance] = null
                c[$executionQueue] = null

                if (c.__debug || GLOBAL_DEBUG.enabled) {
                    const lensName = proposedCore[$lensName]
                    console.debug(`${lensName.padEnd(95)} :extract: ${Object.keys(c)}`)
                }

                resolve(IS_DEV_MODE ? unwrapProxy(c) : c)
            }, null, {push: true}))
    } else {
        return proposedCore
    }
}
