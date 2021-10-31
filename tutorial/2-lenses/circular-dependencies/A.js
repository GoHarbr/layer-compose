import {layerCompose} from '../../../src'
import keyLayer       from "./keyLayer"

export default layerCompose(
    {
        sayA($,_) {
            _.console('A')
        }
    },

    keyLayer,
    {
        B: import('./B.js')
    }
)
