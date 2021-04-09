import {isPromise, isService, renameIntoGetter, renameIntoSetter}                                        from "../utils"
import {
    $$,
    $dataPointer,
    $extendSuper,
    $functionSymbolIds,
    $initializer,
    $runOnInitialize,
    $writableKeys,
    IS_DEV_MODE
}                    from "../const"
import buildInitializer
                     from "./buildInitializer"
import extendSuper
                     from "./extendSuper"
import {unwrapProxy} from "../proxies/utils"

let _compositionId = 0 // for debug purposes

// noinspection FunctionTooLongJS
export default function (composed) {
    _compositionId++
    const compositionId = Symbol(_compositionId + '::composition-id')

    // const $ = {}
    // composed[$runOnInitialize] = [
    //     function create$(instance) {
    //         const _$ = Object.create($)
    //
    //         // const extendWith = instance[$extendSuper]
    //         // _$.$ = extendWith
    //         // if (extendWith) {
    //         //     extendSuper(_$, extendWith)
    //         // }
    //
    //         _$[$$] = instance
    //         instance[compositionId] = _$
    //
    //     },
    //     ...composed[$runOnInitialize]
    // ]

    // composed[$functionSymbolIds] = []


    for (const name in composed) {
        const methodOrService = composed[name]
        if (typeof name == "symbol") continue


        if (isService(methodOrService)) {
            const service = methodOrService

            composed[$runOnInitialize].push(instance => {
                /*
                * todo: make services lazy
                * */

                const s = service(instance)
                instance[name] = s
                // instance[compositionId][name] = s
            })
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
                        const r = method(this, _, opt || {})
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
                        return method(this, this[$dataPointer], opt || {})
                        // return method(this[compositionId], this[$dataPointer], opt || {})
                            // method.compressionMethod)
                    }
                }

                /* Sealing the function */

                composed[name].isSealed = true
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

            // todo. autobind ^

        }
    }

    composed[$initializer] = buildInitializer(composed)

    // Object.freeze($)

    return composed
}
