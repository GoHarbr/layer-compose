import layerCompose                                  from '../../layerCompose'
import detachSelf                                    from "../patterns/detachSelf"

export default layerCompose(
    {
        get($, _) {
            detachSelf($)
        }
    },
)
