import {renameIntoGetter} from "../utils"
import {isFunction}       from "../utils"

export default function (obj) {
    for (const name of Object.keys(obj)) {
        const getterName = renameIntoGetter(name)
        const isGetter = !!getterName

        if (isGetter && isFunction(obj[name])) {
            Object.defineProperty(obj, getterName, {get: obj[name]})
        }
    }
    return obj
}
