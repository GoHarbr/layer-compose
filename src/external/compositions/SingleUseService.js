import layerCompose                                  from '../../layerCompose'
import detachSelf                                    from "../patterns/detachSelf"

export default layerCompose(
    $ => $._detachSelf(),
    {
        _detachSelf($, _) {
            detachSelf($)
        }
    },
)
