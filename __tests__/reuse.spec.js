/*
* Using the same service defeintion across multiple instances
* */

import layerCompose from "../src"

describe("Reusing compositonis across instances", () => {

    test("Two instances of the same composition should not share data", () => {
        const keys = []
        const C = layerCompose({
            method(_) {
                keys.push(_.key)
            }
        })

        const c1 = C({key:1})
        const c2 = C({key:2})

        c1.method()
        c2.method()
        c1.method()
        c2.method()

        expect(keys).toEqual([1,2,1,2])
    })

    test("Extend composition", () => {
        const checkFn = jest.fn()
        const C1 = layerCompose({
            m($) {
                checkFn()
            }
        })

        expect(() => {
            const C2 = layerCompose({tm($) {}}, C1)
            const c2 = C2()
            c2.m()
            c2.tm()
        }).not.toThrow()
        expect(checkFn).toHaveBeenCalled()
    })

    test("Extend composition and lock `opt`", () => {
        const checkFn = jest.fn()
        const C1 = layerCompose({
            m(_, opt) {
                checkFn(opt.key)
            }
        })

        const C2 = layerCompose(
            $ => $.m.lockOpt({key: true}),
            C1
        )

        const c2 = C2()
        c2.m({key: false})
        expect(checkFn).toHaveBeenCalledWith(true)

        const c1 = C1()
        c1.m({key: false})
        expect(checkFn).toHaveBeenCalledWith(false)
    })

    test("Extend composition and use a dependency", () => {
        const checkFn = jest.fn()
        const C1 = layerCompose({
            m(_, opt) {
                return _.key
            }
        })

        const C2 = layerCompose(
            {
                check($, _) {
                    checkFn(_.key, $.m())
                }
            },
            C1
        )

        const i1 = C2({key: 1})
        const i2 = C2({key: 2})

        i1.check()
        expect(checkFn).toHaveBeenCalledWith(1, 1)

        i2.check()
        expect(checkFn).toHaveBeenCalledWith(2, 2)

        i1.check()
        expect(checkFn).toHaveBeenCalledWith(1, 1)

        i2.check()
        expect(checkFn).toHaveBeenCalledWith(2, 2)
    })
})
