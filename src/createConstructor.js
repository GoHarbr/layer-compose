import {isLcConstructor, isService} from './utils'
import {$isService}                 from "./const"

const $setData = Symbol()

export function createConstructor(composedLayers) {
    const dataPointer = {
        data: undefined
    } // this is filled with actual data during instantiation
    const compositionInstance = {}

    const serviceNames = []

    for (const name of Object.keys(composedLayers)) {
        let methodOrService = composedLayers[name]

        if (isService(methodOrService)) {
            compositionInstance[name] = methodOrService
            serviceNames.push(name)
        } else {
            compositionInstance[name] = (opt) => {
                methodOrService(dataPointer.data, opt)
            }
        }
    }

    // for (const name of serviceNames) {
    //     compositionInstance[name] = compositionInstance[name]()
    // }


    function constructor (data) {
        setData(data)
        return compositionInstance
    }
    function setData(d) {
        dataPointer.data = d
        for (const name of serviceNames) {
            compositionInstance[name][$setData](d)
        }
    }

    constructor.asService = () => {
        compositionInstance[$isService] = true
        compositionInstance[$setData] = setData
        return compositionInstance
    }

    return constructor
}
