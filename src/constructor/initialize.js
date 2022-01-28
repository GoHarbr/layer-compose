import { $isInitialized, IS_DEV_MODE } from "../const"
import { queueForExecution } from "../compose/queueForExecution"
import core from "../external/patterns/core"

export default function initialize($, coreUpdate) {
    const has$initializer = typeof $.$ == 'function'

    $(coreUpdate)

    if (has$initializer) {
        $.$()
    }

    queueForExecution($, () => {
        const _ = core($)
        for (const [k,v] of Object.entries(_)) {
            // it's a data accessor!
            if (typeof v === 'function' && !v.length) {
                // it's not hidden
                if (k[0] !== '_') {
                    Object.defineProperty($, '_' + k, {get: v})
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

