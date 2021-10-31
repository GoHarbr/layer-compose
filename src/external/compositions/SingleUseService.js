import layerCompose               from '../../layerCompose'
import detachSelf                 from "../patterns/detachSelf"
import {$isNullCore, IS_DEV_MODE} from "../../const"

export default layerCompose(
    $ => $._detachSelf(),
        $ => $._verifyNullCore(),
    {
        _detachSelf($, _) {
            detachSelf($)
        },

        _verifyNullCore($,_) {
            if (IS_DEV_MODE) {
                if (!_[$isNullCore]) {
                    throw new Error("Single-use lens/service can only use `null` cores")
                }
            }

        }
    },
)
