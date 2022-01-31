import { $isInitialized, IS_DEV_MODE } from "../const"
import { queueForExecution } from "../compose/queueForExecution"
import core from "../external/patterns/core"
import { GLOBAL_DEBUG } from "../external/utils/enableDebug"
import { findLocationFromError } from "../external/utils/findLocationFromError"

export default function initialize($, coreUpdate) {
    const has$initializer = typeof $.$ == 'function'

    $(coreUpdate)

    if (has$initializer) {
        $.$()
    }

    queueForExecution($, () => {
        const _ = core($)
        for (const [k, v] of Object.entries(_)) {
            // it's a data accessor!
            if (typeof v === 'function' && !v.length) {
                // it's not hidden
                const firstLetter = k[0]
                if (firstLetter !== '_' && firstLetter.toUpperCase() === firstLetter) {
                    Object.defineProperty($, '_' + firstLetter.toUpperCase() + k.slice(1),
                        {
                            get: () => {
                                if (GLOBAL_DEBUG.enabled) {
                                    const at = new Error()
                                    const header = `*    \`${k}\``
                                    console.debug(`${header.padEnd(95)} :: ${findLocationFromError(at)}`)
                                }

                                return v()
                            }
                        })
                    // todo. ??? make sure that accessors cannot change _
                }
            }
        }
    })

    if (IS_DEV_MODE) {
        if ($[$isInitialized]) {
            throw new Error()
        }
        $[$isInitialized] = true
    }

}

