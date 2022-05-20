import { getDeadlocks, getOpenQueues } from "../../execution/queueForExecution"

let lastPrintTime
let lastRunTime
export function printDeadlocks(waitTime) {

    const {
        functions, lastExecutionTime
    } = getDeadlocks()

    if (lastExecutionTime > 0 && getOpenQueues() == 0) {
        // if there's an explicit hang time (eg. for manual testing of web pages)
        // wait until that expires
        if (waitTime) {
            // stop
            if (waitTime < (Date.now() - lastRunTime)) return
        } else {
            // stop
            return
        }
    }
    lastRunTime = Date.now()
    setTimeout(printDeadlocks, 1000)

    if (lastExecutionTime !== lastPrintTime && (Date.now() - lastExecutionTime) > 5000) {
        lastPrintTime = lastExecutionTime

        for (const [id, {at, traceId, fnReturn}] of Object.entries(functions)) {
            console.log(id, `${traceId.toString()}`, fnReturn, at.stack)
        }
    }
}
