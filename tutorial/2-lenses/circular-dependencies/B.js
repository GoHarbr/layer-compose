import {layerCompose} from '../../../src'
import keyLayer       from "./keyLayer"

export default layerCompose(
    {
        sayB($,_) {
            _.console('B')
        }
    },

    keyLayer,
    {
        A: import('./A.js')
    }
)
