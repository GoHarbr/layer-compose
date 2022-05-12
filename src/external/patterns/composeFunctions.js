export function composeFunctions(...fns) {
    if (fns.length === 1) return fns[0]

    let fn = fns.shift()
    for (const next of fns) {
        const previous = fn
        fn = function ($,_,o) {
            previous($,_,o)
            next($,_,o)
        }
    }

    return fn
}
