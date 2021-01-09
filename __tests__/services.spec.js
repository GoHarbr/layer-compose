import layerCompose from "../src"
import {List}       from "./compositions/List.layers"

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

        expect(c.anotherService).toBeTruthy()
        expect(checkFn).toHaveBeenCalled()
    })

    test("services should be chainable", () => {
        const checkFn = jest.fn();

        const C = layerCompose(($, d) => {
                const {service} = $

                expect(service).toBeTruthy()
                return {
                    method(d) {}
                }
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
        c.service.sm()

        expect(checkFn).toHaveBeenCalled()
    })

    test("services (with getters) should be chainable", () => {
        const C = layerCompose(($, d) => {
                const {service} = $

                expect(service).toBeTruthy()
                return {
                    method(d) {}
                }
            },
            {
                service: [{
                    getKey(d) {
                        return d.key
                    }
                }]
            })

        const d = {key: 'data'}
        const c = C(d)
        expect(c.service.key).toEqual('data')
        expect(c.service.getKey()).toEqual('data')
    })

    test("precomposed services (with getters) should be chainable", () => {
        const service = layerCompose({
            getKey(d) {
                return d.key
            }
        })

        const C = layerCompose(($, d) => {
                const {service} = $

                expect(service).toBeTruthy()
                return {
                    method(d) {}
                }
            },
            {
                service
            })

        const d = {key: 'data'}
        const c = C(d)
        expect(c.service.key).toEqual('data')
        expect(c.service.getKey()).toEqual('data')
    })

    test("fragments should be reusable", () => {
        const C = layerCompose(
            {
                method() {}
            },
            {
                service: List
            },
            List
        )

        const c = C()

        c.push({item: 1})
        c.service.push({item: 2})
        expect(c.all.includes(1)).toBe(true)
        expect(c.service.all.includes(2)).toBe(true)
        expect(c.service.all.includes(1)).toBe(false)
    })

    test.todo("Service data should be unboxable")
})
