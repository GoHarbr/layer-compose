import layerCompose, {unbox} from "../src"
import {List}                from "./compositions/List.layers"

describe("Shape", () => {
    test("should be readable, but not writable", () => {
        const C = layerCompose({
                a: false
            }
            , {
                b: false
            })

        const c = C({a: 1, b: 2})
        expect(c.a).toBe(1)
        expect(c.b).toBe(2)
        expect(() => c.a = 2).toThrow()
    })

    test("should be readable and writable", () => {
        const C = layerCompose({
                a: false,
                b: true
            })

        const c = C({a: 1, b: 2})
        expect(c.a).toBe(1)
        expect(c.b).toBe(2)
        c.b = 1
        expect(c.b).toBe(1)
        expect(() => c.a = 2).toThrow()
    })

    test("could be used with a builder pattern", () => {
        const C = layerCompose({
                a: false,
                b: true
            })

        const c = C({a: 1, b: 2})
        expect(c.a).toBe(1)
        expect(c.b).toBe(2)

        const s1 = c.setB(3)
        const s2 = s1.getB()
        expect(s2.b).toBe(3)
    })
})
