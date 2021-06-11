import {getLayerId, isPromise, isService, renameIntoGetter, renameIntoSetter}                            from "../utils"
import {$composition, $compositionId, $dataPointer, $initializer, $isSealed, $writableKeys, IS_DEV_MODE} from "../const"
import buildInitializer
                                                                                                         from "./buildInitializer"
import {unwrapProxy}                                                                                     from "../proxies/utils"
import {wrapCompositionWithProxy}                                                                        from "../proxies/wrapCompositionWithProxy"

let _compositionId = 0 // for debug purposes

// noinspection FunctionTooLongJS
export default function seal (composed) {
    _compositionId++
    composed[$compositionId] = composed[$compositionId] || Symbol(_compositionId + '::composition-id')

    for (const name in composed) {
        const methodOrService = composed[name]
        if (typeof name == "symbol") continue


        if (isService(methodOrService)) {
            const serviceName = name.slice(1) // services are stored with _ prefix inside compositions
            const service = methodOrService

            const storeUnder = service[$composition][$compositionId]
            const get = function () {
                let s = this[storeUnder]
                if (!s) {
                    let core = this
                    if (IS_DEV_MODE) {
                        core = wrapCompositionWithProxy(core)
                    }
                    this[storeUnder] = s = service(core)
                }
                return s
            }

            Object.defineProperty(composed, serviceName, { get })
        } else {

            /*
            * if this function belongs to another sealed composition, don't wrap around it
            * */
            if (Object.isExtensible(methodOrService)) {

                let method = methodOrService

                if (IS_DEV_MODE) {
                    composed[name] = function (opt, ...rest) {
                        if (!!opt && (Array.isArray(opt) || rest.length)) {
                            throw new Error("Layer methods can take only named parameters/options or a single argument")
                        }

                        const _ = unwrapProxy(this[$dataPointer]) // todo. is this necessary
                        // const r = method(this[compositionId], _, opt || {})
                        const r = method(this, _, optOrEmpty(opt))
                        // method.compressionMethod)

                        if (isPromise(r) && method.isAsync) {
                            return r.catch(e => {
                                console.error('Promise rejected:', e)
                                throw e
                            })
                        } else {
                            return r
                        }
                    }
                } else {
                    composed[name] = function (opt) {
                        return method(this, this[$dataPointer], optOrEmpty(opt))
                        // return method(this[compositionId], this[$dataPointer], opt || {})
                        // method.compressionMethod)
                    }
                }

                /* Sealing the function */

                composed[name].isSealed = true // todo. remove
                composed[name][$isSealed] = true
                // composed[name].isAsync = method.isAsync
                Object.freeze(composed[name])
            }

            const getterName = renameIntoGetter(name)
            const setterName = renameIntoSetter(name)

            // if these properties become iterable, move this block into extensible check above
            if (getterName) {
                Object.defineProperty(composed, getterName, { get: composed[name], configurable: true, })
                // Object.defineProperty($, getterName, { get: $[name], configurable: true, })
            }

            if (setterName) {
                composed[$writableKeys].push(setterName)
                Object.defineProperty(composed, setterName, { set: composed[name] })
                // Object.defineProperty($, setterName, { set: $[name] })
            }


            // const fnId = Symbol(_compositionId + '-$-' + name)
            // composed[$functionSymbolIds].push(fnId)
            // composed[fnId] = composed[name]

            // $[name] = function (opt) {
            //     const _this = this[$$]
            //     // return _this[fnId].call(_this, opt)
            //     return _this[name].call(_this, opt)
            // }

        }
    }

    composed[$initializer] = buildInitializer(composed)

    return composed
}

function optOrEmpty(what) {
    return what == null ? {} : what
}
