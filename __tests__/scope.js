import layerCompose from "../src"

describe("Scope", () => {
    test.skip("can be narrowed", () => {
        // layerCompose(DataManager.pickData(d => d.must_be_an_object))
    })

    test("can be borrowed", () => {
        const C = layerCompose(({d}) => {
            d({
                defaultKey: 'defaultValue'
            })
            return {}
        })

        C()
    })
})
