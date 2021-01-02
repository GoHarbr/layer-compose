import {isLcConstructor, isService}              from './utils'
import {$dataPointer, $isService, $onInitialize} from "./const"

const $setData = Symbol()

export function createConstructor(composedLayers) {
    const compositionInstance = {
        [$dataPointer]: undefined // this is filled with actual data during instantiation
    }

    const serviceNames = []

    for (const name of Object.keys(composedLayers)) {
        let methodOrService = composedLayers[name]

        if (isService(methodOrService)) {
            compositionInstance[name] = methodOrService
            serviceNames.push(name)
        } else {
            compositionInstance[name] = (opt) => {
                methodOrService(compositionInstance[$dataPointer], opt)
            }
        }
    }

    function constructor (data) {
        setData(data)
        initialize()
        return compositionInstance
    }
    function setData(d) {
        compositionInstance[$dataPointer] = d
        for (const name of serviceNames) {
            compositionInstance[name][$setData](d)
        }
    }

    const initializer = composedLayers[$onInitialize].reduce((a,b) => function (instance) {
        // layers go in order from bottom (first executed) to top (last executed)
        a(instance); b(instance)
    })
    function initialize() {
        initializer(compositionInstance)
        for (const name of serviceNames) {
            compositionInstance[name][$onInitialize]()
        }
    }

    constructor.asService = () => {
        compositionInstance[$isService] = true
        compositionInstance[$setData] = setData
        compositionInstance[$onInitialize] = initialize()
        return compositionInstance
    }

    return constructor
}
