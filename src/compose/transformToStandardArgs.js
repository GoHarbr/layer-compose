/*
* Takes a function with variable arguments and transforms it into a function with shape ($, _, opt)
* */

/*
*
* @DEPRECATED
*
* */


import {functionAsString} from "../utils"
import {IS_DEV_MODE} from '../const'

const symbols = ['$', '_', 'opt']
const paramsExtractorRe = new RegExp('(\\(.+?\\))|([^)(]+?=>)', 'im')
// const decompositionRe = new RegExp('\(^\{.+\})|(\\$,\{.+\})', 'i')
const decompositionRe = new RegExp('\{.+\}', 'i')

export default function (fn) {
    if (!IS_DEV_MODE) return fn

    if (typeof fn.toString != "function") {
        console.warn("Functions cannot be read as strings")
        return fn
    }
    // if (fn.length !== 3) throw new Error('A layer function must take ($, _, opt) as arguments')

    const str = functionAsString(fn)

    let matches = str.match(paramsExtractorRe)
    if (matches) {
        const paramDefinition = matches[0]
        // if (paramDefinition.match(decompositionRe)) {
            // throw new Error('Decomposition is (currently) not allowed in layer methods')
        // }
        const argOrder = ArgOrder(paramDefinition, fn.length)

        if (compilerArgsScrambleCheck(paramDefinition, argOrder)) {
            console.warn('Code has been compiled and function arg names changed. Some dev checks are off: ' + fn.name)
            return fn
        } else {
            if (!argOrder.isValidFunction()) {
                const e = new Error('Functions that do not require super ($) or data/contents (_) access should be defined outside of a composition: ' + fn.name)
                console.error('Functions that do not require super ($) or data/contents (_) access should be defined outside of a composition: '
                    + fn.name + '\n' + fn.toString() + '\n' + e.stack)
                throw e
            }

            if (!argOrder.isInDefinedOrder()) {
                throw new Error('Argument order should be in order ($, _, opt)')
            }

            const [$, _, opt] = argOrder.getPresent()
            if ($ && _ /* && opt -- not necessary because its just ignored if not present */) {
                return fn // no modification needed
            } else {
                if ($) {
                    return ($, _, opt) => fn($, opt)
                } else {
                    return ($, _, opt) => fn(_, opt)
                }
            }
        }
    }

    throw new Error('Programmer error: Function does not follow proper argument format. Must use `$`, `_`, `opt` as arguments: ' + fn.name)
}

function ArgOrder(paramDefinition, paramCount) {
    const indexes = symbols.map(s => {
        let i
        let pd = paramDefinition
        // for cases such as _x being detected as _
        while (pd) {
            i = pd.indexOf(s)
            // check for word boundry
            if (i === -1 || [' ', ',', ')'].includes(pd[i+s.length])) {
                return i
            }
            pd = pd.slice(i + s.length)
        }
        return -1
    })
    const $ = {
        isBefore(arg, other) {

        },

        getPresent() {
            return symbols.map(s => $.has(s))
        },

        has(arg) {
            const si = symbols.indexOf(arg)
            if (si === -1) throw new Error('Programmer error')
            return indexes[si] > -1
        },

        isValidFunction() {
            if ($.has('$') && $.has("_")) {
                // if (paramCount > 2) {
                //     return $.has('opt') // all 3: $,_,opt
                // } else {
                    return paramCount < 4 // $,_
                // }
            } else if ($.has('$')) {
                return paramCount === 1 // a single $
            }
            return false
        },

        isInDefinedOrder() {
            return indexes.reduce((a, b) => {
                if (a === false) return a

                if (a === -1 || b === -1 || a < b) {
                    return b === -1 ? a : b
                } else {
                    return false
                }
            }) !== false
        }
    }

    return $
}

function compilerArgsScrambleCheck(argsString, argOrder) {
    if (argsString && argsString.split(',').length > 1) {
        return !(argOrder.has('$') || argOrder.has('_'))
    }
}
