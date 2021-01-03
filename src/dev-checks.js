import {IS_DEV_MODE} from "./const"

const re = new RegExp('((\\$,d)|(\\$)|d|({.+},d)|({.+},{.+})|{.+})')
export function layerBuilderFormatCheck(layerLike) {
    if (IS_DEV_MODE) {
        if (!re.test(layerLike.toString().replaceAll(' ', ''))) {
            throw new Error("A layer builder must use `$` for service/super access and `d` for data borrow access or use the destructuring")
        }
    }
}
