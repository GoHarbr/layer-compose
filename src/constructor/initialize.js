import { $isInitialized } from "../const"
import { queueForExecution } from "../execution/queueForExecution"

export default function initialize($, coreUpdate) {
    if ($[$isInitialized]) {
        return
    }

    $(coreUpdate)

    const has$initializer = typeof $.$ == 'function'
    if (has$initializer) {
        queueForExecution($, () => {
            $.$()
        })
    }

    queueForExecution($, () => {
        $[$isInitialized] = true
    })
}

