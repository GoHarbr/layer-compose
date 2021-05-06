import layerCompose, {unbox} from "../src"
import {List}                from "./compositions/List.layers"
import View                  from "./compositions/View"

describe("Post composition transformations", () => {
    test("partial", () => {
        const C = layerCompose({
                a: false
            }
            , {
                b: false
            }).partial({
            b: 2
        })

        const c = C({a: 1})
        expect(c.a).toBe(1)
        expect(c.b).toBe(2)
    })

    test("partival over complex composition", () => {
        const v = View()
        expect(v.dom).toBe('container-div')
        expect(v.update().dom).toBe('container-div-update')
    })
})
