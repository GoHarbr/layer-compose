describe("Scope", () => {
    test("can be narrowed", () => {
        layerCompose(DataManager.pickData(d => d.must_be_an_object))
    })
})
