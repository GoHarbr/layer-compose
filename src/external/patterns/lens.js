import {IS_DEV_MODE} from "../../const"
import {parent}      from './parent'
import core          from "./core"

export default function lens($, applicator, parentTypeOrApplicator) {
    const parentType = applicator ? parentTypeOrApplicator : null
    if (!applicator) {
        applicator = parentTypeOrApplicator
    }

    if (IS_DEV_MODE) {
        if (!this?.[$isCompositionInstance]) {
            throw new Error('A `lens` can be applied only over a composition')
        }
        if (typeof applicator !== 'function') {
            throw new Error('Transformer must be a function')
        }
    }


    const p = parent($, parentType)
    const parentCore = core(p)

    applicator({$: p, _: parentCore})

    // if (tRes) {
    //     const lid = getLayerId(this)
    //     this(core(this, lid), tRes)
    // }
}
