import layerCompose from "../src"

describe("Basic layering", () => {
    test("should keep `this` context to passed in data", () => {
        const C = layerCompose({
            method(d) {
                console.log("A", d)
            }
        },{
            method(d) {
                console.log("B", d)
            }
        })

        C("this_obj_str").method()
    })
})
