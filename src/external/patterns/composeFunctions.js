export function composeFunctions(...fns) {
    if (fns.length === 1) return fns[0]

    let fn = fns.shift()
    for (const next of fns) {
        const previous = fn
        fn = async function ($,_,o) {
            await previous($,_,o)
            await next($,_,o)
        }
    }

    return fn
}
