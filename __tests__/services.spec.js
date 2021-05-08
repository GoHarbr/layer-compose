import layerCompose, {IS_DEV_MODE, unbox} from "../src"
import {List}                             from "./compositions/List.layers"

process.on('unhandledRejection', (reason) => {
    console.log('REJECTION', reason)
})

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
                    sm($, _) {
                        checkFn()
                    }
                }]
            })

        const c = C({})
        c.method()
        expect(checkFn).toHaveBeenCalled()
    })

    test.skip("should have access to data", () => {
        const checkFn = jest.fn()

        const C = layerCompose({
                method($, _) {
                    $.service.sm()
                }
            }
            , {
                service: [{
                    sm($, _) {
                        checkFn()
                        expect(_.key).toBe('data')
                    }
                }]
            })

        const d = { key: 'data' }
        const c = C(d)
        c.method()

        expect(checkFn).toHaveBeenCalled()
    })

    test("sub-service should be accessible by parent service", () => {
        const checkFn = jest.fn()

        const C = layerCompose(
            {
                key: false,
            },
            {
                method($, _) {
                    $.Service.serviceMethod()
                }
            },
            {
                Service: [{
                    SubService: {
                        deepMethod($, _, opt) {
                            checkFn()
                            // expect(_.key).toBe('data')

                            if (IS_DEV_MODE) {
                                expect(() => _.key).toThrow()
                            } else {
                                expect(_.key).toBe(undefined)
                            }
                            expect(opt.optKey).toBe('value')
                        }
                    },
                },
                    {
                        serviceMethod($, _) {
                            expect(_.key).toBe('data')
                            $.SubService.deepMethod({ optKey: 'value' })
                        }
                    }
                ]
            })

        const d = { key: 'data' }
        const c = C(d)
        c.method()

        expect(c.key).toBe('data')
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
                        sm($, _) {
                            checkFn()
                        },
                        willThrow($, _) {
                            _.method()
                            checkFn()
                        },

                    },
                },
                    {
                        sm($, _) {
                            _.method()
                        }
                    },
                    {
                        sm($, _) {
                            _.method()
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
                method($, _) {
                }
            },
            {
                service: [{
                    subService: {
                        sm($, _) {
                            checkFn()
                        }
                    },
                },
                    {
                        sm($) {
                        }
                    }
                ]
            })

        const d = { key: 'data' }
        const c = C(d)
        c.service.subService.sm()

        expect(checkFn).toHaveBeenCalled()
    })

    test.skip("services (with getters) should be chainable", () => {
        const C = layerCompose(($, _) => {
                const { service } = $

                expect(service).toBeTruthy()
                return {
                    method($, _) {
                    }
                }
            },
            {
                service: [{
                    getKey($, _) {
                        return d.key
                    }
                }]
            })

        const d = { key: 'data' }
        const c = C(d)
        expect(c.service.key).toEqual('data')
    })

    test.skip("precomposed services (with getters) should be chainable", () => {
        const service = layerCompose({
            getKey($, _) {
                return d.key
            }
        })

        const C = layerCompose(($, _) => {
                const { service } = $

                expect(service).toBeTruthy()
                return {
                    method($, _) {
                    }
                }
            },
            {
                service
            })

        const d = { key: 'data' }
        const c = C(d)
        expect(c.service.key).toEqual('data')
        expect(c.service.getKey()).toEqual('data')
    })

    test("fragments should be reusable", () => {
        const C = layerCompose(
            {
                method($) {
                    $.push({ item: 3 })
                    $.service.push({ item: 4 })
                }
            },
            {
                service: [$ => $.init(), List]
            },
            List
        )

        const c = C({ entities: [] })

        c.method()

        expect(c.all.includes(3)).toBe(true)
        expect(c.all.includes(4)).toBe(false)

        expect(c.service.all.includes(3)).toBe(false)
        expect(c.service.all.includes(4)).toBe(true)


        c.push({ item: 1 })
        c.service.push({ item: 2 })

        expect(c.all.includes(1)).toBe(true)
        expect(c.all.includes(2)).toBe(false)

        expect(c.service.all.includes(1)).toBe(false)
        expect(c.service.all.includes(2)).toBe(true)
    })

    test("Service data should be unboxable", () => {
        const C = layerCompose(
            {
                method($) {
                    $.push({ item: 3 })
                    $.service.push({ item: 4 })
                }
            },
            {
                service: [$ => $.init(), List]
            },
            List
        )

        const c = C({ entities: [] })

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
                parent: true,

                setDataSource($, _, opt) {
                    _.parent = opt + 1
                    _.shared = 'p'
                },
                async update($, _) {
                    pCheck(_.parent, _.shared)
                    IS_DEV_MODE ? expect(() => _.child).toThrow() : expect(_.child).toBe(undefined)
                }
            },
            {
                service: [
                    {
                        shared: true,

                        setDataSource($, _, opt) {
                            _.shared = 'c'
                            _.child = opt - 1
                            _.setDataSource(opt)
                        },
                        async update($, _) {
                            cCheck(_.parent, _.shared, _.child)
                            _.update()
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
                    _.setDataSource(opt)
                },
                async update($, _, opt) {
                    _.update(opt)
                    cCheck(_.parent, _.shared, _.child)
                },
                async externalTrigger($) {
                    $.setDataSource(1)
                    await $.update()
                }
            }
        )

        const C = layerCompose({
                parent: false,
            },
            {
                setDataSource($, _, opt) {
                    _.parent = opt + 1
                    _.shared = 'p'
                },
                async update($, _) {
                    pCheck(_.parent, _.shared)
                    IS_DEV_MODE ? expect(() => _.child).toThrow() : expect(_.child).toBe(undefined)
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

    test("Services should be composable", () => {
        const Ctop = layerCompose({
            Service: [
                ($, _) => _(core => unbox(core)),
                {
                    getTop($, _) {
                        return "top"
                    },
                    call($, _) {
                        _.jestCheck()
                    }
                }],
        })
        const Cbottom = layerCompose({

            Service: {
                getBottom($, _) {
                    return "bottom"
                }
            }
        })

        const C = layerCompose(Ctop, Cbottom)

        const jestCheck = jest.fn()
        const c = C({
            jestCheck
        })

        expect(c.Service.top).toBe('top')
        expect(c.Service.bottom).toBe('bottom')

        c.Service.call()
        expect(jestCheck).toHaveBeenCalledTimes(1)
    })
})
