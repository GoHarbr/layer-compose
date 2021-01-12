/*
* Using the same service defeintion across multiple instances
* */

import layerCompose from "../src"

describe("Reusing compositonis across instances", () => {

    test("Two instances of the same composition should not share data", () => {
        const keys = []
        const C = layerCompose({
            method(d) {
                keys.push(d.key)
            }
        })

        const c1 = C({key:1})
        const c2 = C({key:2})

        c1.method()
        c2.method()
        c1.method()

        expect(keys).toEqual([1,2,1])
    })

    test("Extend composition", () => {
        const checkFn = jest.fn()
        const C1 = layerCompose({
            m() {
                checkFn()
            }
        })

        expect(() => {
            const C2 = layerCompose(C1)
            const c2 = C2()
            c2.m()
        }).not.toThrow()
        expect(checkFn).toHaveBeenCalled()
    })
})
