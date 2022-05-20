import { queueForExecution } from "../../execution/queueForExecution.js"

export function defer($, fn) {
    queueForExecution($, fn, null, {push: true})
}
