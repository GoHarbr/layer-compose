import {isPromise, isService, renameIntoGetter, renameIntoSetter} from "../utils"
import {
    $$,
    $dataPointer,
    $extendSuper,
    $functionSymbolIds,
    $initializer, $isService,
    $runOnInitialize,
    IS_DEV_MODE
} from "../const"
import buildInitializer                                           from "./buildInitializer"
import extendSuper                                              from "./extendSuper"

let _compositionId = 0 // for debug purposes

const lookup$ = {}

// noinspection FunctionTooLongJS
export default function (composed) {
    _compositionId++
    const compositionId = Symbol(_compositionId + '::composition-id')
    const $ = {}

    // composed[$runOnInitialize].unshift(instance => {
    //     const _$ = Object.create($)
    //     // _$[$$] = instance
    //     // instance[compositionId] = _$
    // })

    // composed[compositionId] = {}
    composed[$runOnInitialize] = [function create$ (instance) {
        const _$ = Object.create($)

        // _$[$$] = () => instance // much more performant that // _$[$$] = instance
        _$[$$] = instance // much more performant that // _$[$$] = instance
        instance[compositionId] = _$

    }, ...composed[$runOnInitialize]]

    composed[$extendSuper] = function (extendWith) {
        extendSuper(this[compositionId], extendWith)
    }

    composed[$functionSymbolIds] = []


    for (const name in composed) {
        const methodOrService = composed[name]
        if (typeof name == "symbol") continue


        if (isService(methodOrService)) {
            const service = methodOrService

            composed[$runOnInitialize].push(instance => {
                const d = instance[$dataPointer]
                const s = service(d, instance)
                instance[name] = s
                instance[compositionId][name] = s
            })
        } else {

            /*
            * if this function belongs to another sealed composition, don't wrap around it
            * */
            if (Object.isExtensible(methodOrService)) {

                if (IS_DEV_MODE) {
                    composed[name] = function (opt, ...rest) {
                        if (!!opt && (Array.isArray(opt) || rest.length)) {
                            throw new Error("Layer methods can take only named parameters/options or a single argument")
                        }

                        const r = methodOrService(this[compositionId], this[$dataPointer], opt || {},
                            methodOrService.compressionMethod)

                        if (isPromise(r) && methodOrService.isAsync) {
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
                        return methodOrService(this[compositionId], this[$dataPointer], opt || {},
                            methodOrService.compressionMethod)
                    }
                }

                /* Sealing the function */

                composed[name].isSealed = true
                composed[name].isAsync = methodOrService.isAsync
                Object.freeze(composed[name])

            }

            const fnId = Symbol(_compositionId + '-$-' + name)
            composed[$functionSymbolIds].push(fnId)
            composed[fnId] = composed[name]
            $[name] = function (opt) {
                const _this = this[$$]
                return _this[fnId].call(_this, opt)
            }

            // todo. autobind ^

            const getterName = renameIntoGetter(name)
            if (getterName) {
                Object.defineProperty(composed, getterName, {get: composed[name]})
                Object.defineProperty($, getterName, {get: $[name]})
            }

            const setterName = renameIntoSetter(name)
            if (setterName) {
                Object.defineProperty(composed, setterName, {set: composed[name]})
                Object.defineProperty($, setterName, {set: $[name]})
            }
        }
    }

    composed[$initializer] = buildInitializer(composed)

    Object.freeze($)
    // Object.freeze(composed)

    return composed
}
