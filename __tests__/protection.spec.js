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

    test("Data constructor (accessor) should be protected against writes", () => {
        expect(() => {
            layerCompose(($, d) => {
                d.key = ''
            })
        }).toThrow()

        const C = layerCompose(($, d) => {
            return {
                method() {
                    d.key = 1
                }
            }
        })

        expect(() => {
            C().method()
        }).toThrow()
    })

    test.todo("Function return values should be protected against writes")

    test.todo("Constructors allow for destructuring")
})
