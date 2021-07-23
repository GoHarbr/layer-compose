import layerCompose                         from '../../layerCompose'
import {$compositionId, $parentComposition} from "../../const"

export default layerCompose(
    $ => $._asSingleUseService,
    {
        _asSingleUseService($, _, opt) {
            $[$parentComposition][$compositionId] = false
        }
    },
)
