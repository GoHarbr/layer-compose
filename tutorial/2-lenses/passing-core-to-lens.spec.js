import {layerCompose}   from "../../src"

describe("There are multiple ways to pass a core to a Lens", () => {
    // PS. Lenses were previously called Services


    test("Lenses can get their cores generated (by core generators)", () => {

        const CompositionWithLens = layerCompose({
            Lens: [
                {
                    expect($,_,opt) {
                        expect(_.key).toEqual(opt)
                    }
                }
            ]
        })

        CompositionWithLens({
            Lens: () => ({key: 'val'})
        }).Lens(s => {
            s.expect('val')
        })
    })
})
