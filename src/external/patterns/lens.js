import {$dataPointer, $parentInstance, IS_DEV_MODE} from "../../const"

export default function lens(transformer) {
    return ($,_) => {
        const p = $[$parentInstance]
        let parentCore = p?.[$dataPointer]
        if (IS_DEV_MODE && parentCore) {
            parentCore = Object.create(parentCore)
            Object.freeze(parentCore)
        }

        return transformer(p)
    }
}
