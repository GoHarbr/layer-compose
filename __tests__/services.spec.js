import layerCompose from "../src"

describe("Services", () => {
    test("should be callable", () => {
        const checkFn = jest.fn();
        const C = layerCompose(($, d) => {
            const {service} = $

            return {
                method(d) {
                    service.sm()
                }
            }
        }, {
            service: [{
                sm(d) {
                    checkFn()
                }
            }]
        })

        const c = C({})
        c.method()
        expect(checkFn).toHaveBeenCalled()
    }),

    test("should have access to data", () => {
        const checkFn = jest.fn();

        const C = layerCompose(($, d) => {
            const {service} = $

            // after this point $ is non readable
            // before this point, data is not accessible

            return {
                method(d) {
                    service.sm()
                }
            }
        }, {
            service: [{
                sm(d) {
                    checkFn()
                    expect(d.key).toBe('data')
                }
            }]
        })

        const d = {key: 'data'}
        const c = C(d)
        c.method()

        expect(checkFn).toHaveBeenCalled()
    })

    test("should have access to instantiated services", () => {
        const checkFn = jest.fn();

        const C = layerCompose(($, d) => {
            const {service} = $

            expect(service).toBeTruthy()
            return {
                method(d) {}
            }
        },
            {
                anotherService: [$ => () => {
                    $.service.sm()
                }]
            },
            {
            service: [{
                sm(d) {
                    checkFn()
                    expect(d.key).toBe('data')
                }
            }]
        })

        const d = {key: 'data'}
        const c = C(d)
        c.method()

        expect(checkFn).toHaveBeenCalled()
    })

    test("services should be chainable", () => {

    })
})
