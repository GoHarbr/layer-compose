import layerCompose         from "../src"
import {getDataFromPointer} from "../src/utils"

describe("Scope", () => {
    test("can have defaults set (deep)", () => {
        const C = layerCompose(($, d) => {
            d({
                defaultKey: 'defaultValue',
                deepDefault: {
                    defaultKey: 1
                }
            })
            return {}
        })

        const c = C({
            deepDefault: {
                originalKey: 2
            }
        })

        const d = getDataFromPointer(c)
        expect(d.deepDefault.originalKey).toEqual(2)
        expect(getDataFromPointer(c).deepDefault.defaultKey).toEqual(1)
        expect(getDataFromPointer(c).defaultKey).toEqual('defaultValue')
    })

    test("borrowed values are accessible for writes", () => {
        const C = layerCompose(
            {
                writeDeep(d) {
                   expect(d.second.subsecond).toEqual(2)
                }
            },
            ($, d) => {
            d({
                first: 'defaultValue',
                second: {
                    subsecond: 1
                }
            })

            return {
                writeShallow(d) {
                    d.first = ''
                },
                writeDeep(d) {
                    d.second.subsecond = 2
                },
                checkShallow(d) {
                    expect(d.first).toEqual('')
                }
            }
        })

        const c = C({
            deepDefault: {
                originalKey: 2
            }
        })

        c.writeShallow()
        c.checkShallow()
        expect(getDataFromPointer(c).first).toEqual('')

        c.writeDeep()
        expect(getDataFromPointer(c).second.subsecond).toEqual(2)
    })

    test("borrowed values are the only accessible ones", () => {
        const C = layerCompose(($, d) => {
            d({
                first: 'defaultValue',
                second: {
                    subsecond: 1
                }
            })
            return {
                writeShallow(d) {
                    d.third = 3
                },
                writeDeep(d) {
                    d.second.key = 3
                },
                writeDeeper(d) {
                    d.second.key.key = 3
                },
            }
        })

        const c = C({
            deepDefault: {
                originalKey: 2
            }
        })

        expect(c.writeShallow).toThrow()
        expect(c.writeDeep).toThrow()
        expect(c.writeDeeper).toThrow()
    })

    test("sub-key of borrowed keys are accessible for writes", () => {
        const C = layerCompose(($, d) => {
            d({
                first: 'defaultValue',
                second: {
                    subsecond: 1
                }
            })

            return {
                writeShallow(d) {
                    d.first = ''
                },
                writeDeep(d) {
                    d.second.subsecond = 2
                },
            }
        })

        const c = C({
            deepDefault: {
                originalKey: 2
            }
        })

        c.writeShallow()
        expect(getDataFromPointer(c).first).toEqual('')

        c.writeDeep()
        expect(getDataFromPointer(c).second.subsecond).toEqual(2)
    })

    test.todo("sub-key of borrowed keys are accessible for writes only if those keys dont exist already")

    test("no write access if nothing is borrowed", () => {
        const C = layerCompose(($, d) => {
            return {
                writeShallow(d) {
                    d.third = 4
                },
                writeDeep(d) {
                    d.second.key = 3
                },
                check(d) {
                    expect(d.third).toEqual(3)
                    expect(d.second.key).toEqual(2)
                }
            }
        })

        const d = {
            third: 3,
            second: {
                key: 2
            }
        }
        const c = C(d)

        expect(c.writeShallow).toThrow()
        expect(c.writeDeep).toThrow()

        c.check()

        const pd = getDataFromPointer(c)
        expect(pd.third).toEqual(3)
        expect(pd.second.key).toEqual(2)
    })

    test("cannot borrow the same key twice (layers)", () => {
        expect(() => {
            const C = layerCompose(($, d) => {
                d({
                    key: {
                        subkey: 1
                    }
                })
            }, ($, d) => d({
                key: {
                    subkey: 2
                }
            }))

            C()
        }).toThrow()
    })

    test("cannot borrow the same key twice (service)", () => {
        expect(() => {
            const C = layerCompose(($, d) => {
                d({
                    key: {
                        subkey: 1
                    }
                })
            }, {
                service: [($, d) => {
                    d({
                        key: {
                            subkey: 2
                        }
                    })
                }]
            })

            C()
        }).toThrow("Cannot borrow the same key")
    })

    test("Services carry their own scope", () => {
        const checkMethod = jest.fn()
        const checkBottomService = jest.fn()
        const checkTopService = jest.fn()

        const bottomServices = {
            bottomService: [
                {
                    method(d) {
                        checkBottomService(d.public, d.private)
                    }
                },

                ($, d) => {
                    d({
                        private: 'bottom-default'
                    })
                    return {
                        method(d) {
                            d.private = 'bottom'
                        }
                    }
                }
            ]
        }

        const topServices = {
            topService: [
                {
                    method(d) {
                        checkTopService(d.public, d.private)
                    }
                },

                ($, d) => {
                    d({
                        private: 'top-default'
                    })
                    return {
                        method(d) {
                            d.private = 'top'
                        }
                    }
                }
            ]
        }

        const C = layerCompose(
            topServices,
            ($, d) => {
                return {
                    method(d) {
                        checkMethod(d.public, d.private)
                        $.bottomService.method()
                    }
                }
            },
            bottomServices
        )

        const c = C({public: 'public', private: 'original'})
        c.method()
        c.topService.method()

        expect(checkMethod).toHaveBeenCalledWith('public', 'original')
        expect(checkBottomService).toHaveBeenCalledWith('public', 'bottom')
        expect(checkTopService).toHaveBeenCalledWith('public', 'top')
    })
})
