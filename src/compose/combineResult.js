import {isPromise} from "../utils"

export function combineResult(acc, next) {
    if (acc && next) {
        return next
    } else if (acc) {
        return acc
    } else {
        return next
    }
}

// export function combineResult(acc, next, isAsync, compressionMethod) {
//
//     // todo find out how much of a performance drawdown for combining results
//
//     if (acc && next) {
//         if (isAsync) {
//             if (isPromise(acc)) {
//                 if (isPromise(next)) {
//                     return acc.then(a => next.then(n => combineResult(a, n)))
//                 } else {
//                     return acc.then(a => combineResult(a, next))
//                 }
//             } else {
//                 return next.then(n => combineResult(acc, n))
//             }
//         } else {
//             if (compressionMethod) {
//                 return compressionMethod(acc, next)
//             }
//             // default combination method (taking the last value)
//             return next
//         }
//     } else if (acc) {
//         return acc
//     } else {
//         return next
//     }
// }
