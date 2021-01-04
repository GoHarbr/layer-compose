import {IS_DEV_MODE} from "./const"
import {getDataFromPointer}     from "./utils"
import {$setData}               from './const'
import {wrapDataWithProxy}      from "./proxies"

export function generateDataAccessor() {
    let defaults
    let isDataPrivate = false

    return {
        // fixme. constructor should be a proxy with
        // get so that ({services}, {key1, key2})
        // generates a defaults for key1, key2 (sets to undefined)

        constructor: function (borrowedWithDefaults, usePrivateDataLayer) {
            if (typeof borrowedWithDefaults !== 'object') {
                throw new Error('Default data must be an object, not a primitive')
            }
            defaults = borrowedWithDefaults
            isDataPrivate = usePrivateDataLayer
        },
        initializer: layerId => (compositionInstance) => {
            let data = getDataFromPointer(compositionInstance)

            if (isDataPrivate) {
                data = Object.create(data)
                if (IS_DEV_MODE) {
                    // no check for write access on private data
                    data = proxies(data, {}, {isGetOnly: true})
                }
                compositionInstance[$setData](data)
            }

            if (defaults) {
                injectDefaults(data, defaults)
            }

            if (IS_DEV_MODE) {
                if (!isDataPrivate) {
                    /* defaults also act as the borrow definition */
                    data = wrapDataWithProxy(layerId, data, defaults, {isGetOnly: false})
                    compositionInstance[$setData](data)
                }
            }
        }
    }
}

/** Deep defaults injection */
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
