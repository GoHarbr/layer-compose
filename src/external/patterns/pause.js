import { queueForExecution } from "../../execution/queueForExecution"

export default function pause($) {
    let resolveWith

    const p = new Promise((resolve, reject) => {
        resolveWith = resolve
    })

    queueForExecution($, () => p, null, {next: true})

    return resolveWith
}
