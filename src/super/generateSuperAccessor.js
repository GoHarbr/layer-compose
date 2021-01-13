import {wrapSuperWithProxy} from "./wrapSuperWithProxy"

export function generateSuperAccessor(composedUpTo) {
    const selfInstancePointer = {
        pointer: undefined
    }

    /*todo
    *  add ability to curry a function and then use it in another
    *   override a method if the same one is present in this layer
    * */

    return {
        initializer: compositionInstance => {
            // if (!!selfInstancePointer.pointer) {
            //     throw new Error('Programmer error: this initializer has already been used')
            // }
            selfInstancePointer.pointer = compositionInstance
        },
        constructor: generateConstructor(composedUpTo, selfInstancePointer)
    }
}

function generateConstructor(composedUpTo, selfInstancePointer) {
    composedUpTo = wrapSuperWithProxy(composedUpTo, selfInstancePointer) // in DEV mode checks for defined gets

    return composedUpTo
}
