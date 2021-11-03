import {assign, layerCompose} from '../../../src'
import keyLayer               from "./keyLayer"
import consoleLayer           from "./consoleLayer"

export default layerCompose(
    {
        sayA($, _) {
            _.console('A')
        }
    },

    keyLayer,
    consoleLayer,

    {
        B: import('./B.js')
    }
)
