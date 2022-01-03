import {queueForExecution} from "../../compose/queueForExecution"

export default function pause($) {
    let resolveWith

    const p = new Promise((resolve, reject) => {
        resolveWith = resolve
    })

    queueForExecution($, () => p, null, {next: true})

    return (fn, arg) => {
        if (fn) {
            queueForExecution($, arg ? () => fn(arg) : fn, null, {next: true})
            // resolveWith(arg ? () => fn(arg) : fn)
            resolveWith(new Promise(resolve => {}))
        } else {
            resolveWith(new Promise(resolve => {}))
        }
    }
}
