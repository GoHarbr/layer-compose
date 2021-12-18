import {isService}                                  from "../utils"
import {$dataPointer, $parentInstance, IS_DEV_MODE} from "../const"
import {unwrapProxy}                                from "../proxies/utils"
import {wrapCompositionWithProxy}                   from "../proxies/wrapCompositionWithProxy"
import {queueForExecution}                          from "../compose/queueForExecution"
import {constructFromComposition}                   from "./createConstructor"


// noinspection FunctionTooLongJS
export default function seal(composition, $) {

    for (const name in composition) {
        const methodOrLens = composition[name]
        if (typeof name == "symbol") continue

        if (isService(methodOrLens)) {
            $[name] = sealService(methodOrLens, $)
        } else {
            $[name] = sealMethod(methodOrLens, $)
        }
    }

    return $
}


function sealService(lensComposition, parent) {

    return function makeLens(cbOrCore, cb) {
        let lensCore = null
        let cbWithService

        if (typeof cbOrCore === 'object') {
            lensCore = cbOrCore
            cbWithService = cb
        } else {
            cbWithService = cbOrCore
        }

        if (!cbWithService) throw new Error("Callback must be present to access the service")

        parent = IS_DEV_MODE ? wrapCompositionWithProxy(parent) : parent

        queueForExecution(parent, async () => {
            const [$] = await constructFromComposition(lensComposition, lensCore)

            $[$parentInstance] = parent

            return cbWithService($)
        })

    }

}

function sealMethod(method, $) {

    return function (opt, ...rest) {
        if (IS_DEV_MODE) {
            if (!!opt && (Array.isArray(opt) || rest.length)) {
                throw new Error("Layer methods can take only named parameters/options or a single argument")
            }
        }

        const _ = IS_DEV_MODE ? unwrapProxy($[$dataPointer]) : $[$dataPointer]

        queueForExecution($, () => method($, _, optOrEmpty(opt)))
    }

}

function optOrEmpty(what) {
    return what == null ? {} : what
}
