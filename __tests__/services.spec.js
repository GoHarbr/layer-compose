import layerCompose from "../src"

describe("Services", () => {
    test("should be callable", () => {
        const checkFn = jest.fn();
        const C = layerCompose({
            service: [{
                sm() {
                    checkFn()
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
        expect(checkFn).toHaveBeenCalled()
    }),

    test("should have access to data", () => {
        const checkFn = jest.fn();

        const C = layerCompose({
            service: [{
                sm(_) {
                    checkFn(_)
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

        const d = {key: 'data'}
        const c = C(d)
        c.method()

        expect(checkFn).toHaveBeenCalledWith(d)
    })
})
