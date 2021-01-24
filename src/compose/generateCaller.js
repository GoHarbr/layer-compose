import {$$} from "../const"

export default function generateCaller(fn) {
    if (Object.isExtensible(fn)) {
        return fn
    } else {
        return ($, _, opt) => fn.call($[$$], opt)
    }
}
