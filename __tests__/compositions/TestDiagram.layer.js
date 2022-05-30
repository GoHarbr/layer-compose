import { lc } from "../../src"
import { RemoteLens } from "./TestDiagramLens.layer"

export const TestDiagram = lc()

TestDiagram._layer = {
    fn($,_,) {
        _.key = null

        console.log('fn')
        $.Lens(l => {
            l.lensFn()
        })
    },

    Lens: {
        lensFn($,_) {
            console.log('lens fn')
        }
    },

    RemoteLens,

    _Accessor: (_) => _.key
}

TestDiagram._layer2 = {
    fn($) {
        return RemoteLens(l => {
            l.remoteFn()
        })
    }
}

TestDiagram._layer3 = {
    callMeFirst($) {
        $.fn()
    },

    fn() {
        console.log('fn 3')
    }
}
