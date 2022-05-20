import { $awaitedUponBy, $isCompositionInstance, $traceId } from "../const"

export async function awaitLens(lens, parent, callback) {
    if (shouldAwait(lens, parent)) {
        lens[$awaitedUponBy].add(parent)
        await lens
        await callback(lens)
        lens[$awaitedUponBy].delete(parent)

        // return new Promise(resolve => {
        //     queueForExecution(parent, async () => {
        // }, () => {
        // resolve()
        // })
        // })
    } else {
        await callback(lens)
    }
}

export async function awaitReturn(ret, instance) {
    if (!ret || !ret[$isCompositionInstance]) return ret
    
}

// export function wrapAwait(instance) {
//     instance.await = async (...what) => {
//
//         for (const w of what) {
//             await awaitLens(w, instance)
//         }
//
//     }
// }


// async function awaitInQueue(what, who) {
//     if (!what) return
//
//     if (!what[$isCompositionInstance]) {
//         await what
//     } else if (shouldAwait(what, who)) {
//         what[$awaitedUponBy].add(who[$traceId])
//
//         await new Promise(resolve => {
//             queueForExecution(who, async () => {
//                 await what
//             }, () => {
//                 what[$awaitedUponBy].delete(who[$traceId])
//                 resolve()
//             })
//         })
//     }
//     // otherwise keep going
// }

function shouldAwait(what, who, seen = new Set()) {
    seen.add(who[$traceId])

    // if (who[$awaitedUponBy].has(what[$traceId])) {
    //     return false
    // } else {

        // todo. This is a depth first search. Turn it into a breadth-first search for performance
        // though that's just a hunch

        let result = true
        who[$awaitedUponBy].forEach(nextWho => {
            if (result) {
                const nextId = nextWho[$traceId]
                if (nextId == what[$traceId]) {
                    result = false
                    return // continue to exit
                }

                if (!seen.has(nextId)) {
                    result = shouldAwait(what, nextWho)
                }
            }
        })

        return result
        // return result == null ? true : result
    // }
}
