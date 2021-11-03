import {layerCompose} from '../../../src'
import keyLayer       from "./keyLayer"
import consoleLayer   from "./consoleLayer"

export default layerCompose(
    {
        sayB($,_) {
            _.console('B')
        }
    },

    keyLayer,
    consoleLayer,

    {
        A: import('./A.js')
    }
)
