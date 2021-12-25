import {findLocationFromError}     from "../external/utils/findLocationFromError"
import splitLocationIntoComponents from "../external/utils/splitLocationIntoComponents"
import {rewriteFileWithTypes}      from "./addTypes"

const trackedLocations = {}

export function writeTypesToDisk() {
    for (const [locationId, functionsWithTypes] of Object.entries(trackedLocations)) {
        const locComponents = splitLocationIntoComponents(locationId)

        const flowTypesByFn = {}

        for (const [name, types] of Object.entries(functionsWithTypes)) {
            flowTypesByFn[name] = {
                $: `: { [key : ${types.$.map(k => `'${k}'`).join('|')}] : (o: ?any) => void }`,
                _: `: ${objectTypeToFlow(types._)}`,
                o: `: ?any`
            }
        }

        rewriteFileWithTypes({ ...locComponents, types: flowTypesByFn })
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

    selfTracker.$ = type$($)
    selfTracker._ = type_(_)

    // trackedLocations[]
}

function type$($) {
    return Object.keys($)
}

function type_(_) {
    return Object.fromEntries(
        Object.entries(_).map(([k,v]) => {
            let t = typeof v
            if (t === 'object') {
                if (v === null) t = null
                if (Array.isArray(v)) t = []
            }
            return [k, t]
        })
    )
}

function objectTypeToFlow(definitions) {
    if (Array.isArray(definitions)) {
        // if (!definitions.length) {
            return 'Array<mixed>'
        // }


    } else if (typeof definitions == 'object') {
        const props = Object.entries(definitions).map(([k, t]) => {
            return `${k} : ${objectTypeToFlow(t)}`
        }).join(',')

        return `{ ${props} }`
    } else {
        return definitions || 'null'
    }
}
