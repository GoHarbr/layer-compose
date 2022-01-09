import {$composition, $compositionId, $isLc, $layers} from "../../const"
import {getCompositionById}                           from "../../compose/markWithId"

export function isExtensionOf($, ofType) {
    const baseTypeId = ofType[$compositionId] ? ofType[$compositionId] : ofType[$composition][$compositionId]
    if (!baseTypeId) throw new Error('Type must be a Composition constructor or prototype')
    if (!$[$layers] && !$[$compositionId]) throw new Error("$ must be composition or instance")

    const composition = $[$layers] ? $ : getCompositionById($[$compositionId])
    const layers = composition[$layers]
    return baseTypeId === composition[$compositionId] || layers && layers.has(baseTypeId)
}
