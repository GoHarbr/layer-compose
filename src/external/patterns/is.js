import { $compositionId } from "../../const"
import { getLayerId } from "../../utils"

/**
* strict version of isExtensionOf
* */
export function is($, ofType) {
    // const baseTypeId = ofType[$compositionId] ? ofType[$compositionId] : ofType[$composition][$compositionId]
    const baseTypeId = getLayerId(ofType, {noSet: true})
    if (!baseTypeId) throw new Error('Type must be a Composition constructor or prototype')

    if (!$[$compositionId]) {
        // not a composition, thus does not extend
        return false
    }

    return baseTypeId === $[$compositionId]
}
