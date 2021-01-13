import {$borrowedKeys, $isPrivateData, IS_DEV_MODE} from "./const"
import {getDataFromPointer}                         from "./utils"
import {$setData}                                        from './const'
import {wrapDataConstructorWithProxy, wrapDataWithProxy} from "./proxies/proxies"

export function generateDataAccessor(layerId) {
    let defaults
    let locatorError

    let constructor = function (borrowedWithDefaults) {
        if (typeof borrowedWithDefaults !== 'object') {
            throw new Error('Default data must be an object, not a primitive')
        }
        defaults = borrowedWithDefaults

        if (IS_DEV_MODE) {
            locatorError = new Error
        }
    }
    if (IS_DEV_MODE) {
        constructor = wrapDataConstructorWithProxy(constructor)
    }

    return {
        constructor,
        initializer: compositionInstance => {
            let data = getDataFromPointer(compositionInstance)

            if (defaults) {
                injectDefaults(data, defaults)
            }

            if (IS_DEV_MODE) {
                    addBorrowKeys(layerId, data, defaults, locatorError)
                    /*
                    * borrow check happens on each function call in compose.js
                    * */
            }
        }
    }
}

// function assignDefaults(existing, next) {
//     if (!existing || typeof existing != "object") return next
//     if (!next || typeof existing != "object") return existing
//
//     const existingKeys = Object.keys(existing)
//     for (const nk of Object.keys(next)) {
//         if (existingKeys.includes(nk)) {
//             throw new Error('Cannot borrow the same key: `' + nk)
//         }
//
//         existing[nk] = next[nk]
//     }
// }

function addBorrowKeys(layerId, data, borrowDefaults, locatorError) {
    if (!!data && !!borrowDefaults && typeof borrowDefaults == "object" && typeof data == 'object') {
        const _bk = (data).hasOwnProperty($borrowedKeys) && data[$borrowedKeys]
        if (!_bk) {
            data[$borrowedKeys] = {}
        }

        const addKeys = Object.keys(borrowDefaults)
        const existingKeys = Object.values(data[$borrowedKeys]).flat()
        const conflictKey = existingKeys.find(_ => addKeys.some(b => b === _))

        if (conflictKey) {
            locatorError.message = 'Cannot borrow the same key: `' + conflictKey + '`\n'
            throw locatorError
        }

        data[$borrowedKeys][layerId] = addKeys

        for (const k in data) {
            addBorrowKeys(layerId, data[k], borrowDefaults[k])
        }
    }
}

/** Deep defaults injection */
function injectDefaults(into, defaults) {
    if (typeof into === 'object' && !!into) {
        // const _bk = into[$borrowedKeys]
        // const existingBorrowKeys = Object.values(_bk || {}).flat()

        const presentKeys = Object.entries(into)
            .filter(_ => _[1] !== undefined)
            .map(_ => _[0])
        const missingKeys = Object.keys(defaults)
            .filter(k => !presentKeys.includes(k))

        for (const k of missingKeys) {
            into[k] = defaults[k]
        }

        for (const k of presentKeys) {
            // const conflictKey = existingBorrowKeys.find(_ => k === _)
            // if (conflictKey) {
            //     throw new Error('Cannot borrow the same key: ' + conflictKey)
            // }

            const nextDefault = defaults[k]
            if (typeof nextDefault === 'object' && !!nextDefault) injectDefaults(into[k], nextDefault)
        }
    }
}
