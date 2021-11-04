/**
 * returns object stored on parent, or generates a new one
 * */
import {IS_DEV_MODE,$dataPointer, $parentInstance} from "../../const"

export default function (transformer) {
    return ($, _) => {
        const p = $[$parentInstance]
        let parentCore = p?.[$dataPointer]
        if (IS_DEV_MODE && parentCore) {
            parentCore = new Proxy(parentCore, {
                set() {
                    throw new Error("Lenses must not affect objects that they are reading from")
                }
            })
        }
        return transformer(parentCore)
    }
}

