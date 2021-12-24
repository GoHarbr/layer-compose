import {$executionQueue, $isCompositionInstance, $lensName, $parentInstance} from "../const"
import {queueForExecution}                                                   from "../compose/queueForExecution"
import core                                                                  from "../external/patterns/core"
import {GLOBAL_DEBUG}                                                        from "../external/utils/enableDebug"

export function unwrapCompositionAsCore(proposedCore) {
    if (proposedCore[$isCompositionInstance]) {
        // extract the core once all queued operations are done
        return new Promise(resolve =>
            queueForExecution(proposedCore, () => {
                const c = Object.assign({}, core(proposedCore))
                c[$parentInstance] = null
                c[$executionQueue] = null

                if (c.__debug || GLOBAL_DEBUG.enabled) {
                    const lensName = proposedCore[$lensName]
                    console.debug(`${lensName.padEnd(50)} :extract: ${Object.keys(c)}`)
                }

                resolve(c)
            }))
    } else {
        return proposedCore
    }
}
