import {$composition, $compositionId, $isLc, $layerOrder, $layers} from "../../const"
import {getCompositionById}                                        from "../../compose/markWithId"

export function isExtensionOf($, ofType) {
    const baseTypeId = ofType[$compositionId] ? ofType[$compositionId] : ofType[$composition][$compositionId]
    if (!baseTypeId) throw new Error('Type must be a Composition constructor or prototype')
    if (!$[$layerOrder] && !$[$compositionId]) throw new Error("$ must be composition or instance")

    const composition = $[$layerOrder] ? $ : getCompositionById($[$compositionId])
    const layers = composition[$layerOrder]
    return baseTypeId === composition[$compositionId] || layers && layers.includes(baseTypeId)
}
