import { lc } from "../../src"
import { RemoteLens } from "./TestDiagramLens.layer"

export const TestDiagram = lc()

TestDiagram._layer = {
    fn($, _,) {
        _.key = null
        console.log('f n')
        $.Lens(l => {
            l.lensFn()
        })
    },

    Lens: {
        lensFn($, _) {
            console.log('lens fn -- ch')
            // and stzs comment
            console.log('more code from')
        }
    },

    RemoteLens,

    _Accessor: (_) => _.key + 1
}

TestDiagram._layer2 = {
    fn($) {
        return $.RemoteLens(l => {
            l.remoteFn()
        })
    }
}

TestDiagram._layer3 = {
    callMeFirst($) {
        $.fn()
    },

    fn($) {
        console.log('accessor', $._Accessor)
    }
}
