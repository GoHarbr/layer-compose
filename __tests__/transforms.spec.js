import layerCompose from "../src"
import View         from "./compositions/View"

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

        const c = C({ a: 1 })
        expect(c.a).toBe(1)
        expect(c.b).toBe(2)
    })

    test("partival over complex composition", () => {
        const v = View()
        expect(v.dom).toBe('container-div')
        expect(v.update().dom).toBe('container-div-update')
    })

    test("partial as a service", () => {
        const C = layerCompose({
            Service: View
        })
        const c = C()

        expect(c.Service.dom).toBe('container-div')
        expect(c.Service.update().dom).toBe('container-div-update')
    })

    test("wrapped partial as a service", () => {
        const C = layerCompose({
                Service: layerCompose(View)
            },
            {
                a: false
            }).withDefaults({
            a: 1
        })
        const c = C()

        expect(c.Service.dom).toBe('container-div')
        expect(c.Service.update().dom).toBe('container-div-update')
        expect(c.a).toBe(1)
    })
})
