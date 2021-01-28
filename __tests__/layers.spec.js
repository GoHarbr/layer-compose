import layerCompose, {unbox} from "../src"
import {unwrapProxy}         from "../src/proxies/utils"

describe("Layering", () => {
    test("should have access to data", () => {
        const check = jest.fn()

        const C = layerCompose({
            method($, _) {
                check("A", _.key)
            }
        }, {
            method($, _) {
                check("B", _.key)
            }
        })

        C({key: 'v'}).method()
        expect(check).toHaveBeenCalledWith('A', 'v')
        expect(check).toHaveBeenCalledWith('B', 'v')
    })

    test("layer fragments are composed in proper order", () => {
        let top
        let bottom
        let middle
        const C = layerCompose(
            [{
                top($, _) {
                    top = 0
                }
            },
                {
                    top($, _) {
                        top = 1
                    },
                    middle($, _) {
                        middle = 0
                    }
                },

            ],

            [
                {
                    middle($, _) {
                        middle = 1
                    },
                    top($, _) {
                        top = 2
                    },
                },
                {
                    top($, _) {
                        top = 3
                    },
                    bottom($, _) {
                        bottom = 0
                    }
                }
            ]
        )

        const c = C()

        c.top()
        expect(top).toEqual(0)

        c.bottom()
        expect(bottom).toEqual(0)

        c.middle()
        expect(middle).toEqual(0)
    })

    test('should be able to set default `opt`', () => {
        const checkFn = jest.fn()

        const c = layerCompose($ => {
            $.method.defaultOpt({default: 'default', key: 'default'})
        }, {
            method($, _, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith({key: 'v', default: 'default'})
    })

    test('should be able to set lock in `opt`', () => {
        const checkFn = jest.fn()

        const c = layerCompose($ => {
            $.method.lockOpt({default: 'default', key: 'default'})
        }, {
            method($, _, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v', otherKey: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith({otherKey: 'v', key: 'default', default: 'default'})
    })

    test('locking `opt` only affects the layers below', () => {
        const checkTop = jest.fn()
        const checkMiddle = jest.fn()
        const checkBottom = jest.fn()

        const c = layerCompose(
            {
                method($, _, opt) {
                    checkTop(opt)
                }
            },
            $ => {
                $.method.lockOpt({default: 'default', key: 'default'})
            }, {
                method($, _, opt) {
                    checkMiddle(opt)
                }
            }, {
                method($, _, opt) {
                    checkBottom(opt)
                }
            })()

        const opt = {key: 'v', otherKey: 'v'}
        c.method(opt)
        expect(checkTop).toHaveBeenCalledWith({otherKey: 'v', key: 'v'})
        expect(checkMiddle).toHaveBeenCalledWith({otherKey: 'v', key: 'default', default: 'default'})
        expect(checkBottom).toHaveBeenCalledWith({otherKey: 'v', key: 'default', default: 'default'})
    })

    test("methods could be getters", () => {
        const C = layerCompose(
            {
                getMyKey($, _) {
                    return _.key
                }
            }
        )

        const c = C({key: 'v'})

        expect(c.myKey).toBe('v')
    })

    test("methods could be setters", () => {
        const C = layerCompose(
            {
                setMyKey(_, opt) {
                    _.key = opt
                },
                internalSet($, _) {
                    $.setMyKey('internal')
                    expect(_.key).toBe('internal')
                }
            }
        )

        const c = C({key: 'v'})

        expect(() => c.myKey = 'set').toThrow()
        expect(unbox(c).key).toBe('v')

        c.internalSet()
        expect(unbox(c).key).toBe('internal')
    })

    test("all methods of same name should be called within a composition", () => {
        /* watcher methods are methods defined above the call site */

        const checkWatch = jest.fn()
        const checkNormal = jest.fn()
        const C = layerCompose({
            watch(_) {
                checkWatch()
            }
        }, {
            method($) {
                $.watch()
            }
        }, {
            watch(_) {
                checkNormal()
            }
        })

        const c = C()
        c.method()
        expect(checkNormal).toHaveBeenCalled()
        expect(checkWatch).toHaveBeenCalled()
    })

    test("methods accessed with $ should not be called on higher composition", () => {
        /* watcher methods are methods defined above the call site */

        const checkHigher = jest.fn()
        const checkNormal = jest.fn()
        const C1 = layerCompose({
            method($) {
                $.watch()
            }
        }, {
            watch(_) {
                checkNormal(_.key)
            }
        })

        const C2 = layerCompose({
            watch(_) {
                checkHigher(_.key)
            }
        }, C1)

        const c = C2({key: 'v'})
        c.method()
        expect(checkNormal).toHaveBeenCalledWith('v')
        expect(checkHigher).not.toHaveBeenCalled()

        c.watch()
        expect(checkHigher).toHaveBeenCalledWith('v')
    })

    test("compression method for method return values can be changed", () => {
        const expected = {k1:'v1', k2:'v2', k3:'v3'}

        const C1 = layerCompose($ => {
            $.method.compressWith((acc, next) => ({...acc, ...next}))
        },{
            check($) {
                expect(unwrapProxy($.method())).toEqual(expected)
            },
            method(_) {
                return {k2: 'v2'}
            }
        }, {
            method(_) {
                return {k1: 'v1'}
            }
        }, {
            method(_) {
                return {k3: 'v3'}
            }
        })

        const c = C1({})
        const r = c.method()
        expect(unwrapProxy(r)).toEqual(expected)
    })

    test("when composing two sealed layers methods should be executed vertically", () => {
        expect.assertions(2)

        const L1 = layerCompose({
            method(_) {
                expect(_.key).toEqual('v')
            }
        })
        const L2 = layerCompose({
            method(_) {
                expect(_.key).toEqual('v')
            }
        })

        const C = layerCompose(L2, L1)
        const c = C({key: 'v'})

        c.method()
    })

    test("when composing two sealed layers methods the comprossion method can be changed", () => {
        expect.assertions(3)

        const expected = {k1:'v1', k2:'v2'}

        const L1 = layerCompose({
            method(_) {
                return {k1: 'v1'}
            }
        })
        const L2 = layerCompose({
            method(_) {
                return {k2: 'v2'}
            }
        })

        const C1 = layerCompose($ => {
            $.method.compressWith((acc, next) => ({...acc, ...next}))
        }, L2, L1)
        const c1 = C1()

        const r1 = c1.method()
        expect(unwrapProxy(r1)).toEqual(expected)

        const C2 = layerCompose($ => {
            $.method.compressWith((acc, next) => ({...acc, ...next}))
        }, {
            check($) {
                expect(unwrapProxy($.method())).toEqual(expected)
            }
        },L2, L1)
        const c2 = C2()

        const r2 = c2.method()
        expect(unwrapProxy(r2)).toEqual(expected)
        c2.check()
    })
})
