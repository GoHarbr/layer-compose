import {queueForExecution} from "../../compose/queueForExecution.js"

export function defer($, fn) {
    queueForExecution($, fn, null, {push: true})
}
