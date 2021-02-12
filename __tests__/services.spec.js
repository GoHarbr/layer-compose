import layerCompose, {unbox} from "../src"
import {List}                from "./compositions/List.layers"

describe("Services", () => {
    test("should be callable", () => {
        const checkFn = jest.fn()
        const C = layerCompose({
                method($, _) {
                    $.service.sm()
                }
            }
            , {
                service: [{
                    sm(_) {
                        checkFn()
                    }
                }]
            })

        const c = C({})
        c.method()
        expect(checkFn).toHaveBeenCalled()
    })

    test("should have access to data", () => {
        const checkFn = jest.fn()

        const C = layerCompose({
                method($, _) {
                    $.service.sm()
                }
            }
            , {
                service: [{
                    sm(_) {
                        checkFn()
                        expect(_.key).toBe('data')
                    }
                }]
            })

        const d = {key: 'data'}
        const c = C(d)
        c.method()

        expect(checkFn).toHaveBeenCalled()
    })

    test("sub-service should be accessible by parent service", () => {
        const checkFn = jest.fn()

        const C = layerCompose(
            {
                method($, _) {
                    $.service.sm()
                }
            },
            {
                service: [{
                    subService: {
                        sm(_, {optKey}) {
                            checkFn()
                            expect(_.key).toBe('data')
                            expect(optKey).toBe('value')
                        }
                    },
                },
                    {
                        sm($) {
                            $.subService.sm({optKey: 'value'})
                        }
                    }
                ]
            })

        const d = {key: 'data'}
        const c = C(d)
        c.method()

        expect(checkFn).toHaveBeenCalled()
    })

    test("service should have access to direct parent", () => {
        const checkFn = jest.fn()

        const C = layerCompose(
            {
                method($, _) {
                    checkFn()
                }
            },
            {
                service: [{
                    subService: {
                        sm($) {
                            checkFn()
                        },
                        willThrow($) {
                            $.$.method()
                            checkFn()
                        },

                    },
                },
                    {
                        sm($) {
                            $.$.method()
                        }
                    },
                    {
                        sm($) {
                            $.$.method()
                            expect($.subService.willThrow).toThrow()
                            $.subService.sm()
                        }
                    }
                ]
            })

        const c = C()
        c.service.sm()

        expect(checkFn).toHaveBeenCalledTimes(3)
    })

    test.todo("service should have access to direct parent *only*")

    test.todo('parent methods/services do not overwrite own methods/services of a service')

    test("services should be chainable", () => {
        const checkFn = jest.fn()

        const C = layerCompose(
            {
                method($, _) {}
            },
            {
                service: [{
                    subService: {
                        sm(_) {
                            checkFn()
                            expect(_.key).toBe('data')
                        }
                    },
                },
                    {
                        sm($) {}
                    }
                ]
            })

        const d = {key: 'data'}
        const c = C(d)
        c.service.subService.sm()

        expect(checkFn).toHaveBeenCalled()
    })

    test.skip("services (with getters) should be chainable", () => {
        const C = layerCompose(($, _) => {
                const {service} = $

                expect(service).toBeTruthy()
                return {
                    method(_) {
                    }
                }
            },
            {
                service: [{
                    getKey(_) {
                        return d.key
                    }
                }]
            })

        const d = {key: 'data'}
        const c = C(_)
        expect(c.service.key).toEqual('data')
        expect(c.service.getKey()).toEqual('data')
    })

    test.skip("precomposed services (with getters) should be chainable", () => {
        const service = layerCompose({
            getKey(_) {
                return d.key
            }
        })

        const C = layerCompose(($, _) => {
                const {service} = $

                expect(service).toBeTruthy()
                return {
                    method(_) {
                    }
                }
            },
            {
                service
            })

        const d = {key: 'data'}
        const c = C(_)
        expect(c.service.key).toEqual('data')
        expect(c.service.getKey()).toEqual('data')
    })

    test("fragments should be reusable", () => {
        const C = layerCompose(
            {
                method($) {
                    $.push({item:3})
                    $.service.push({item:4})
                }
            },
            {
                service: [$ => $.init(), List]
            },
            List
        )

        const c = C({entities: []})

        c.method()

        expect(c.getAll().includes(3)).toBe(true)
        expect(c.getAll().includes(4)).toBe(false)

        expect(c.service.getAll().includes(3)).toBe(false)
        expect(c.service.getAll().includes(4)).toBe(true)


        c.push({item: 1})
        c.service.push({item: 2})

        expect(c.getAll().includes(1)).toBe(true)
        expect(c.getAll().includes(2)).toBe(false)

        expect(c.service.getAll().includes(1)).toBe(false)
        expect(c.service.getAll().includes(2)).toBe(true)
    })

    test("Service data should be unboxable", () => {
        const C = layerCompose(
            {
                method($) {
                    $.push({item:3})
                    $.service.push({item:4})
                }
            },
            {
                service: [$ => $.init(), List]
            },
            List
        )

        const c = C({entities: []})

        c.method()

        expect(unbox(c).entities.includes(3)).toBe(true)
        expect(unbox(c).entities.includes(4)).toBe(false)

        expect(unbox(c.service).entities.includes(3)).toBe(false)
        expect(unbox(c.service).entities.includes(4)).toBe(true)
    })

    test("Services (non-sealed) should trigger parent methods", async () => {
        const pCheck = jest.fn()
        const cCheck = jest.fn()

        const C = layerCompose(
            {
                setDataSource(_, opt) {
                    _.parent = opt + 1
                    _.shared = 'p'
                },
                async update(_) {
                    pCheck(_.parent, _.shared)
                    expect(() => _.child).toThrow()
                }
            },
            {
                service: [
                    {
                        setDataSource($, _, opt) {
                            _.shared = 'c'
                            _.child = opt - 1
                            $.$.setDataSource(opt)
                        },
                        async update($, _) {
                            cCheck(_.parent, _.shared, _.child)
                            $.$.update()
                        },
                        async externalTrigger($) {
                            $.setDataSource(1)
                            await $.update()
                        }
                    }
                ]
            }
        )

        const c = C()
        await c.service.externalTrigger()

        expect(pCheck).toHaveBeenLastCalledWith(2, 'p')
        expect(cCheck).toHaveBeenLastCalledWith(2, 'c', 0)
    })

    test("Services (sealed) should trigger parent methods", async () => {
        const pCheck = jest.fn()
        const cCheck = jest.fn()

        const Service = layerCompose(
            {
                setDataSource($, _, opt) {
                    _.shared = 'c'
                    _.child = opt - 1
                    $.$.setDataSource(opt)
                },
                async update($, _, opt) {
                    $.$.update(opt)
                    cCheck(_.parent, _.shared, _.child)
                },
                async externalTrigger($) {
                    $.setDataSource(1)
                    await $.update()
                }
            }
        )

        const C = layerCompose(
            {
                setDataSource($, _, opt) {
                    _.parent = opt + 1
                    _.shared = 'p'
                },
                async update($, _) {
                    pCheck(_.parent, _.shared)
                    expect(() => _.child).toThrow()
                }
            },
            {
                Service
            }
        )

        const c = C()
        await c.Service.externalTrigger()

        expect(pCheck).toHaveBeenLastCalledWith(2, 'p')
        expect(cCheck).toHaveBeenLastCalledWith(2, 'c', 0)
    })
})
