import layerCompose from "../src"

describe("Basic layering", () => {
    test("should keep `this` context to passed in data", () => {
        const C = layerCompose({
            method() {
                console.log("A", this)
            }
        },{
            method() {
                console.log("B", this)
            }
        })

        C("this_obj_str").method()
    })
})
