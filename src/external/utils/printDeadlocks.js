import { getDeadlocks } from "../../compose/queueForExecution"

let lastPrintTime
export function printDeadlocks() {
    setTimeout(printDeadlocks, 10000)

    const {
        functions, lastExecutionTime
    } = getDeadlocks()

    if (lastExecutionTime !== lastPrintTime && (Date.now() - lastExecutionTime) > 5000) {
        lastPrintTime = lastExecutionTime

        for (const [id, {at, traceId, fnReturn}] of Object.entries(functions)) {
            console.log(id, `${traceId}`, fnReturn, at.stack)
        }
    }
}
