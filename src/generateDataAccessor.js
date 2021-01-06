import {$borrowedKeys, $isPrivateData, IS_DEV_MODE} from "./const"
import {getDataFromPointer}                         from "./utils"
import {$setData}          from './const'
import {wrapDataWithProxy} from "./proxies/proxies"

export function generateDataAccessor(layerId) {
    let defaults

    return {
        constructor: function (borrowedWithDefaults) {
            if (typeof borrowedWithDefaults !== 'object') {
                throw new Error('Default data must be an object, not a primitive')
            }
            defaults = borrowedWithDefaults
        },
        initializer: compositionInstance => {
            let data = getDataFromPointer(compositionInstance)

            if (defaults) {
                injectDefaults(data, defaults)
            }

            if (IS_DEV_MODE) {
                    addBorrowKeys(layerId, data, defaults)
                    /*
                    * borrow check happens on each function call in compose.js
                    * */
            }
        }
    }
}

function addBorrowKeys(layerId, data, borrowDefaults) {
    if (typeof borrowDefaults == "object" && typeof data == 'object') {
        const _bk = data[$borrowedKeys]
        if (!_bk) {
            data[$borrowedKeys] = {}
        }

        const addKeys = Object.keys(borrowDefaults)
        const existingKeys = Object.values(data[$borrowedKeys]).flat()
        const conflictKey = existingKeys.find(_ => addKeys.some(b => b === _))

        if (conflictKey) {
            throw new Error('Cannot borrow the same key: ' + conflictKey)
        }

        data[$borrowedKeys][layerId] = addKeys

        for (const k in data) {
            addBorrowKeys(layerId, data[k], borrowDefaults[k])
        }
    }
}

/** Deep defaults injection */
function injectDefaults(into, defaults) {
    if (typeof into === 'object') {
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

            if (typeof defaults[k] === 'object') injectDefaults(into[k], defaults[k])
        }
    }
}
