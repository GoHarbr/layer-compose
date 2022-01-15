import {$composition, $compositionId, $isLc, $layerOrder, $layers} from "../../const"
import {getCompositionById}                                        from "../../compose/markWithId"
import {getLayerId}                                                from "../../utils"

export function isExtensionOf($, ofType) {
    // const baseTypeId = ofType[$compositionId] ? ofType[$compositionId] : ofType[$composition][$compositionId]
    const baseTypeId = getLayerId(ofType, {noSet: true})
    if (!baseTypeId) throw new Error('Type must be a Composition constructor or prototype')
    if (!$[$layerOrder] && !$[$compositionId]) throw new Error("$ must be composition or instance")

    const composition = $[$layerOrder] ? $ : getCompositionById($[$compositionId])[$composition]
    if (!composition) {
        throw new Error("Could not find composition. Likely a Programmer Mistake")
    }
    const layers = composition[$layerOrder]
    return baseTypeId === composition[$compositionId] || layers && layers.includes(baseTypeId)
}
