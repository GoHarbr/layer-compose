/*
* Takes a function with variable arguments and transforms it into a function with shape ($, _, opt)
* */

import {functionAsString} from "../utils"

const symbols = ['$', '_', 'opt']
const paramsExtractorRe = new RegExp('(\\(.+?\\))|(.+?=>)', 'i')
const decompositionRe = new RegExp('\(^\{.+\})|(\\$,\{.+\})', 'i')

export default function (fn) {
    try {
        const str = functionAsString(fn)

        let matches = str.match(paramsExtractorRe)
        if (matches) {
            const paramDefinition = matches[0]
            if (paramDefinition.match(decompositionRe)) {
                throw new Error('Decomposition of super ($) or data/contents (_) is not allowed in layer methods')
            }
            const argOrder = ArgOrder(paramDefinition)

            if (!argOrder.isValidFunction()) {
                throw new Error('Functions that do not require super ($) or data/contents (_) access should be defined outside of a composition')
            }

            if (!argOrder.isInDefinedOrder()) {
                throw new Error('Argument order should be in order ($, _, opt)')
            }

            const [$, _, opt] = argOrder.getPresent()

            if (fn.length === 3 && !($ && _ && opt)) {
                throw new Error('Missing `opt` parameter')
            }

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

        throw new Error('Programmer error: Function does not follow proper argument format. Must use `$`, `_`, `opt` as arguments')
    } catch (e) {
        // if (IS_DEV_MODE) throw e
        console.warn(e)
    }
}

function ArgOrder(paramDefinition) {
    const indexes = symbols.map(s => paramDefinition.indexOf(s))
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
            return $.has('$') || $.has("_")
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
