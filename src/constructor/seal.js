import {
    $at, $compositionId,
    $dataPointer,
    $fullyQualifiedName, $isLc,
    $layers,
    $lensName,
    $parentInstance,
    $writableKeys,
    IS_DEV_MODE
}                                  from "../const"
import {unwrapProxy}               from "../proxies/utils"
import {wrapCompositionWithProxy}  from "../proxies/wrapCompositionWithProxy"
import {queueForExecution}         from "../compose/queueForExecution"
import {GLOBAL_DEBUG}              from "../external/utils/enableDebug"
import {findLocationFromError}     from "../external/utils/findLocationFromError"
import {core_unsafe}               from "../external/patterns/core"
import {trackExternalFunctionCall} from "../auto-type/mapper/mapper"


// noinspection FunctionTooLongJS
export default function seal(composition, $) {
    $[$writableKeys] = [$parentInstance, $lensName]
    $[$dataPointer] = null
    $[$compositionId] = composition[$compositionId]

    for (const name in composition) {
        const methodOrLens = composition[name]
        if (typeof name == "symbol") continue


        if (methodOrLens[$isLc]) {
            const at = composition[$at]
            $[name] = sealService(methodOrLens, $, { name, at })
        } else {
            $[name] = sealMethod(methodOrLens, $, {name})
        }
    }

    return $
}


function sealService(lensConstructor, parent, { name, at }) {
    return function makeLens(cbOrCore, cb) {
        let lensCore = null
        let cbWithService

        if (typeof cbOrCore === 'object') {
            lensCore = cbOrCore
            cbWithService = cb
        } else {
            lensCore = {}
            cbWithService = cbOrCore
        }

        if (!cbWithService) throw new Error("Callback must be present to access the service")

        parent = IS_DEV_MODE ? wrapCompositionWithProxy(parent) : parent

        const fullyQualifiedName = (parent[$fullyQualifiedName] || '') + `.${name}`
        const diagnostics = !IS_DEV_MODE ? null : () => {
            if (GLOBAL_DEBUG.enabled) {
                const header = `>>   ${fullyQualifiedName} () lens`
                console.debug(`${header.padEnd(65)} :: ${findLocationFromError(at)}`)
            }
        }

        queueForExecution(parent, () => {
            let childCompletedResolve
            const childCompletedBlock = new Promise(resolve => childCompletedResolve = resolve)

            // waiting for child to complete initialization before parent proceeds
            queueForExecution(parent, () => childCompletedBlock, null, {next: true})

            return new Promise(resolveParent => {
                diagnostics && diagnostics()
                // if (lensCore[$parentInstance]) {
                //     console.warn('Object already has a parent instance reference')
                // }

                // lensCore[$parentInstance] = parent
                lensConstructor(lensCore, $ => {
                    const r = cbWithService($)
                    r && r.catch && r.catch(e => console.error(`ERROR during instantiation >> ${fullyQualifiedName} () lens`, e))
                }, {
                    lensName: name, fullyQualifiedName,
                    preinitializer: ($) => new Promise(resolveChild => {
                        const _ = core_unsafe($)
                        if (_[$parentInstance]) {
                            console.warn('Object already has a parent instance reference')
                        }
                        _[$parentInstance] = parent

                        const initializerName = `_${name}`
                        if (initializerName in parent) {
                            parent[initializerName]($)
                        }

                        queueForExecution(parent, resolveChild, () => {

                            // releasing parent after child initializes
                            queueForExecution($, childCompletedResolve, null, {push: true})

                        }, {next: true})


                        resolveParent()

                    }),
                    parent,
                })
            })

        })
    }

}

function sealMethod(method, $, { name }) {

    return function (opt, ...rest) {
        if (IS_DEV_MODE) {
            if (!!opt && rest.length) {
                throw new Error("Layer methods can take only named parameters/options or a single argument")
            }
        }
        const _ = IS_DEV_MODE ? unwrapProxy($[$dataPointer]) : $[$dataPointer]

        if (GLOBAL_DEBUG.enabled) {
            const fullyQualifiedName = $[$fullyQualifiedName]
            const header = `## ${name} on ${fullyQualifiedName}`
            console.debug(`${header.padEnd(65)} :: ${findLocationFromError(new Error()) || ''}`)

            trackExternalFunctionCall(fullyQualifiedName, name, $[$compositionId])
        }


        method($, _, optOrEmpty(opt))
        // queueForExecution($, () => method($, _, optOrEmpty(opt)))

        return $
    }

}

function optOrEmpty(what) {
    return what == null ? {} : what
}
