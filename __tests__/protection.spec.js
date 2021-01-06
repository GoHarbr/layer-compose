import layerCompose from "../src"

describe("Protective mechanisms", () => {
    test("Must-Be-Defined proxy should have exceptions", () => {
        expect.assertions(2)

        const C = layerCompose({
            method(d) {
                expect(JSON.stringify(d)).toEqual('{"k":"v"}')
            }
        })

        const c = C({k:'v'})
        c.method()
        expect(JSON.stringify(c)).toEqual('{}')
    })
})
