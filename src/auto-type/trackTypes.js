import { findLocationFromError } from "../utils/findLocationFromError"
import splitLocationIntoComponents from "../utils/splitLocationIntoComponents"
import { $getterNames, GETTER_NAMING_CONVENTION_RE, IS_DEV_MODE } from "../const"
import equal from 'fast-deep-equal/es6'

const trackedLocations = {}

let rewriteFileWithTypes

function flowRepresentationFor$(types) {
    const methods = []
    const accessors = []
    const lenses = []

    for (const k of types) {
        const firstLetter = k[0]
        if (firstLetter === firstLetter.toUpperCase()) {
            const secondLetter = k[1]
            if (firstLetter === '_' && secondLetter && secondLetter === secondLetter.toUpperCase()) {
                accessors.push(k)
            } else {
                lenses.push(k)
            }
        } else {
            methods.push(k)
        }
    }

    const lensesStr = lenses.length ? `${lenses.map(k => `'${k}' : ((coreUpdate: {}, cb: ?(lens: {}) => void) => Promise<void>)`).join(',')}` : ''
    const methodsStr = methods.length ? `, ${methods.map(k => `'${k}' : (o: ?any) => {}`).join(',')}` : ''
    const accessStr = accessors.length ? `, ${accessors.map(k => `'${k}' : any`).join(',')}` : ''
    return `: { (coreUpdate: {}): void, ${lensesStr} ${methodsStr} ${accessStr}  }`
}

import('fs').catch((e) => {
    console.error('Failed to import `fs`')
}).then(fs => {
    if (fs) {
        return import("./addTypes").then(({ rewriteFileWithTypes: fn }) => {
            rewriteFileWithTypes = fn
        })
    } else {
        rewriteFileWithTypes = false
    }
})

export function writeTypesToDisk() {
    if (!IS_DEV_MODE) return

    for (const [locationId, functionsWithTypes] of Object.entries(trackedLocations)) {
        const locComponents = splitLocationIntoComponents(locationId)

        const flowTypesByFn = {}

        for (const [name, types] of Object.entries(functionsWithTypes)) {
            let _type = objectTypeToFlow(types._)
            const is_Empty = _type === '{}'

            const flowComment_ = `: ${_type.slice(0, _type.length - 1)}${!is_Empty && ',' || '[string]: any'}  }`.replace('[', '-[')
            // if (is_Empty) _type = '{ '

            // const _otype = objectTypeToFlow(types.o)

            // todo. sort (consistent) by key length

                flowTypesByFn[name] = {
                    $: flowRepresentationFor$(types.$),
                    _: flowComment_,
                    o: `: {+[key: string]: any}`
                }
        }

        if (rewriteFileWithTypes) {
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
    selfTracker._ = typeObj(_, { existing: selfTracker._ })
    selfTracker.o = typeObj(opt, { existing: selfTracker.o })

    // trackedLocations[]
}

function type$($) {
    return Object.keys($).concat($[$getterNames])
}

function typeObj(obj, { depth = 0, maxDepth = 1, showHidden = false }) {
    const _typeof = typeof obj

    if (_typeof === 'object') {
        if (!obj) return null
        if (Array.isArray(obj)) return obj.map(v => typeObj(v, { depth: depth + 1, maxDepth }))

        const className = obj.constructor?.name
        if (className) {
            if (className == 'Set') return 'Set<mixed>'
            if (className == ('Map')) return 'Map<mixed, mixed>'
        }
        // if (obj[$isCompositionInstance]) return '$_'

        // todo. go over prototype
        const types = {}
        let count = 0
        for (const k in obj) {
            if (!showHidden && k.startsWith('_') && !GETTER_NAMING_CONVENTION_RE.test(k)) continue

            count++

            // todo. check for getters

            // objects with such numerous properties are probably not in need of typing
            if (count > 100) return {}

            const v = obj[k]
            if (depth < maxDepth) {
                types[k] = typeObj(v, { depth: depth + 1, maxDepth })
            } else {
                types[k] = obj ? typeof obj : null
            }
        }
        return types

    } else {
        return _typeof
    }
}

function getCommonObjectShape(objs) {
    if (objs.length && objs.every(o => !!o && typeof o === 'object')) {

        objs = [...objs]
        const first = objs.pop()

        const common = typeObj(first, { maxDepth: 1 })
        for (const o of objs) {
            for (const k of Object.keys(common)) {
                if (!(k in o)) {
                    // removing key that does not exist on all objects
                    delete common[k]
                } else {
                    // check that the type is the same
                    if (!equal(common[k], o[k])) {
                        // if not the same, delete from common
                        delete common[k]
                    }
                }
            }

            if (!Object.keys(common).length) return null
        }

        return common
    }

    return null
}

function objectTypeToFlow(definitions) {
    if (Array.isArray(definitions)) {
        if (definitions.length) {
            const common = getCommonObjectShape(definitions)
            if (common) {
                return `Array< ${objectTypeToFlow(common)} >`
            }
        }
        // when common type is not available
        return 'Array<mixed>'

    } else if (typeof definitions == 'object' && !!definitions) {
        const common = getCommonObjectShape(Object.values(definitions))
        if (common) {
            const keys = Object.keys(definitions).map(k => `'${k}'`).join('|')
            return `{[${keys}]: ${objectTypeToFlow(common)} }`
        } else {
            const props = Object.entries(definitions).map(([k, t]) => {
                const kStr = !Number.isNaN(parseInt(k)) || k.includes('-') || k.includes('.') ? `'${k}'` : k
                return `${kStr} : ${objectTypeToFlow(t)}`
            }).join(', ')

            if (!props.length) return '{}'

            return props && `{ ${props} }` || ''
        }
    } else {
        if (typeof definitions == 'string') {
            let ret = definitions === 'object' ? '{}' : definitions
            return ret === 'undefined' ? 'null' : ret
        }
        return definitions || 'null'
    }
}
