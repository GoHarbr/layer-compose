import { lc } from "../../src"

export const TestDiagram = lc()

TestDiagram._layer = {
    fn($,_,) {
        console.log('fn')
        $.Lens(l => {
            l.lensFn()
        })
    },

    Lens: {
        lensFn($,_) {
            console.log('lens fn')
        }
    }
}
