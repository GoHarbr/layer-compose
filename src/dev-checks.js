import {IS_DEV_MODE} from "./const"

const reBuilder = new RegExp('((\\$,d)|(\\$)|d|({.+},d)|({.+},{.+})|{.+})')
const reMethod = new RegExp('((d,opt)|d|opt|({.+},opt)|({.+},{.+})|{.+})')


export function layerBuilderFormatCheck(layerLike) {
    if (IS_DEV_MODE) {
        if (!reBuilder.test(layerLike.toString().replaceAll(' ', ''))) {
            throw new Error("A layer builder must use `$` for service/super access and `d` for data borrow access or use destructuring")
        }
    }
}

export function layerMethodFormatCheck(method) {
    if (IS_DEV_MODE) {
        if (method.length > 2) throw new Error("Layer method must have at most 2 arguments: `d` and `opt`")

        if (method.length !== 0 && !reMethod.test(method.toString().replaceAll(' ', ''))) {
            throw new Error("A layer method must use `d` for data access and `opt` for options access or use destructuring")
        }
    }
}
