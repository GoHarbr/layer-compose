import layerCompose from "../src"

describe("Services", () => {
    test.skip("should be callable", () => {
        // const
        const C = layerCompose({
            service: [{
                sm() {
                    console.log('sm')
                }
            }]
        }, ({$}) => {
            const {service} = $

            // data.layer(defaults) -- layer
            // data.borrow(defaults) -- only one layer can set defaults, only one has write access after all
            // or data({defaults_of_borrowed})

            return {
                method() {
                    service.sm()
                }
            }
        })

        const c = C({})
        c.method()
    }),

    test("should have access to data", () => {
        // const
        const C = layerCompose({
            service: [{
                sm(_) {
                    console.log('sm', _)
                }
            }]
        }, ({$}) => {
            const {service} = $

            // data.layer(defaults) -- layer
            // data.borrow(defaults) -- only one layer can set defaults, only one has write access after all
            // or data({defaults_of_borrowed})

            // after this point $ is non readable
            // before this point, data is not accessible

            return {
                method() {
                    service.sm()
                }
            }
        })

        const c = C({key: 'data'})
        c.method()
    })
})
