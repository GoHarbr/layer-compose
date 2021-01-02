import {getDataFromPointer} from "./utils"

export function generateDataAccessor() {
    let defaults
    let borrowedKeys

    return {
        constructor: function (borrowedWithDefaults, asNewDataLayer) {
            if (typeof borrowedWithDefaults !== 'object') {
                throw new Error('Default data must be an object, not a primitive')
            }
            defaults = borrowedWithDefaults
            borrowedKeys = Object.keys(borrowedWithDefaults)
        },
        initializer: (compositionInstance) => {
            const d = getDataFromPointer(compositionInstance)

            if (defaults) {
                injectDefaults(d, defaults)
            }
        }
    }
}

/* Deep defaults injection */
function injectDefaults(into, defaults) {
    if (typeof into === 'object') {
        const presentKeys = Object.entries(into)
            .filter(_ => _[1] !== undefined)
            .map(_ => _[0])
        const missingKeys = Object.keys(defaults)
            .filter(k => !presentKeys.includes(k))

        for (const k of missingKeys) {
            into[k] = defaults[k]
        }

        for (const k of presentKeys) {
            if (typeof defaults[k] === 'object') injectDefaults(into[k], defaults[k])
        }
    }
}
