import {isService}                                                                                from "../utils"
import {
    $at,
    $borrowedKeys,
    $dataPointer, $fullyQualifiedName,
    $layers,
    $lensName,
    $parentInstance,
    $writableKeys,
    IS_DEV_MODE
} from "../const"
import {unwrapProxy}                                                                              from "../proxies/utils"
import {wrapCompositionWithProxy}                                                                 from "../proxies/wrapCompositionWithProxy"
import {queueForExecution}                                                                        from "../compose/queueForExecution"
import {GLOBAL_DEBUG}          from "../external/utils/enableDebug"
import {findLocationFromError} from "../external/utils/findLocationFromError"


// noinspection FunctionTooLongJS
export default function seal(composition, $) {
    $[$writableKeys] = [$parentInstance, $lensName]
    $[$dataPointer] = null

    for (const name in composition) {
        const methodOrLens = composition[name]
        if (typeof name == "symbol") continue


        if (isService(methodOrLens)) {
            const at = methodOrLens[$layers][$at]
            $[name] = sealService(methodOrLens, $, {name, at})
        } else {
            $[name] = sealMethod(methodOrLens, $)
        }
    }

    return $
}


function sealService(lensConstructor, parent, {name, at}) {
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
            if (lensCore.__debug || GLOBAL_DEBUG.enabled) {
                const header = `>>   ${fullyQualifiedName} () lens`
                console.debug(`${header.padEnd(50)} :: ${findLocationFromError(at)}`)
            }
        }

        queueForExecution(parent, () => new Promise((resolve, reject) => {
            diagnostics && diagnostics()
            if (lensCore[$parentInstance]) {
                console.warn('Object already has a parent instance reference')
            }

            lensCore[$parentInstance] = parent
            lensConstructor(lensCore, $ => {
                cbWithService($)
                $.then(resolve, reject)
            }, {lensName: name, fullyQualifiedName})
        }))
    }

}

function sealMethod(method, $) {

    return function (opt, ...rest) {
        if (IS_DEV_MODE) {
            if (!!opt && rest.length) {
                throw new Error("Layer methods can take only named parameters/options or a single argument")
            }
        }

        const _ = IS_DEV_MODE ? unwrapProxy($[$dataPointer]) : $[$dataPointer]

        method($, _, optOrEmpty(opt))
        // queueForExecution($, () => method($, _, optOrEmpty(opt)))

        return $
    }

}

function optOrEmpty(what) {
    return what == null ? {} : what
}
