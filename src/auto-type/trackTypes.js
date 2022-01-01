import {findLocationFromError}     from "../external/utils/findLocationFromError"
import splitLocationIntoComponents           from "../external/utils/splitLocationIntoComponents"
import {$isCompositionInstance, IS_DEV_MODE} from "../const"

const trackedLocations = {}

let rewriteFileWithTypes
export function writeTypesToDisk() {
    if (!IS_DEV_MODE) return

    for (const [locationId, functionsWithTypes] of Object.entries(trackedLocations)) {
        const locComponents = splitLocationIntoComponents(locationId)

        const flowTypesByFn = {}

        for (const [name, types] of Object.entries(functionsWithTypes)) {
            let _type = objectTypeToFlow(types._)
            const is_Empty = !_type
            if (is_Empty) _type = '{ '

            // const _otype = objectTypeToFlow(types.o)

            // todo. sort (consistent) by key length

            flowTypesByFn[name] = {
                $: `: { [key : ${types.$.map(k => `'${k}'`).join('|')}] : (o: ?any) => void }`,
                _: `: ${_type.slice(0, _type.length - 1)}${!is_Empty && ', ' || ''}-[string]: any }`,
                o: `: ?any`
            }
        }

        if (rewriteFileWithTypes == null) {
            import('fs').catch(() => null).then(fs => {
                if (fs) {
                    return import("./addTypes").then(({rewriteFileWithTypes: fn}) => {
                        rewriteFileWithTypes = fn
                        rewriteFileWithTypes({ ...locComponents, types: flowTypesByFn })
                    })
                } else {
                    rewriteFileWithTypes = false
                }
            })
        } else {
            rewriteFileWithTypes({ ...locComponents, types: flowTypesByFn })
        }

    }
}

export function trackTypes({
                               at, name, $, _, opt
                           }) {
    const loc = findLocationFromError(at)
    const { id } = splitLocationIntoComponents(loc)

    let trackedLocation = trackedLocations[id]
    let selfTracker = trackedLocation?.[name]
    if (!trackedLocation) {
        trackedLocation = trackedLocations[id] = {}
    }
    if (!selfTracker) {
        selfTracker = trackedLocation[name] = {}
    }

    selfTracker.$ = type$($, selfTracker.$)
    selfTracker._ = typeObj(_, {existing: selfTracker._})
    selfTracker.o = typeObj(opt, {existing: selfTracker.o})

    // trackedLocations[]
}

function type$($) {
    return Object.keys($)
}

function typeObj(obj, {existing, depth = 0}) {
    const _typeof = typeof obj

    if (_typeof === 'object') {
        if (!obj) return null
        if (Array.isArray(obj)) return []
        // if (obj[$isCompositionInstance]) return '$_'

        return Object.fromEntries(
            Object.entries(obj).map(([k, v]) => {
                if (depth < 2) {
                    return [k, typeObj(v, { depth: depth + 1 })]
                } else {
                    return [k, obj ? typeof obj : null]
                }
            })
        )

    } else {
        return _typeof
    }
}

function objectTypeToFlow(definitions) {
    if (Array.isArray(definitions)) {
        // if (!definitions.length) {
            return 'Array<mixed>'
        // }


    } else if (typeof definitions == 'object' && !!definitions) {
        const props = Object.entries(definitions).map(([k, t]) => {
            return `${k} : ${objectTypeToFlow(t)}`
        }).join(', ')

        return props && `{ ${props} }` || ''
    } else {
        if (typeof definitions == 'string') {
            return definitions === 'object' ? '{}' : definitions
        }
        return definitions || 'null'
    }
}
