import { $isInitialized } from "../const"
import { queueForExecution } from "../compose/queueForExecution"

export default function initialize($, coreUpdate) {
    if ($[$isInitialized]) {
        return
    }
    $[$isInitialized] = true


    $(coreUpdate)

    const has$initializer = typeof $.$ == 'function'
    if (has$initializer) {
        queueForExecution($, () => {
            $.$()
        })
    }
}

