import layerCompose, {unbox} from "../src"
import {getDataFromPointer}  from "../src/utils"

describe("Scope", () => {
    test("layers can borrow values", () => {
        expect.assertions(5)

        const C = layerCompose(
            {
                writeDeep(_) {
                    expect(_.second.subsecond).toEqual(2)
                }
            }, {
                writeShallow(_) {
                    _.first = ''
                },
                writeDeep(_) {
                    _.second.subsecond = 2
                },
                checkShallow(_) {
                    expect(_.first).toEqual('')
                }
            })

        const c = C({
            deepDefault: {
                originalKey: 2
            },
            second: {}
        })

        c.writeShallow()
        c.writeShallow()
        c.checkShallow()
        expect(getDataFromPointer(c).first).toEqual('')

        c.writeDeep()
        c.writeDeep()
        expect(getDataFromPointer(c).second.subsecond).toEqual(2)
    })

    test("auto-borrow prevents writes to the same key by different sealed compositions", () => {
        expect.assertions(2)

        const C = layerCompose(
            {
                writeDeep(_) {
                    _.second.subsecond = 3
                }
            },

            layerCompose({
                writeShallow(_) {
                    _.first = ''
                },
                writeDeep(_) {
                    _.second.subsecond = 2
                },
                checkShallow(_) {
                    expect(_.first).toEqual('')
                }
            })
        )

        const c = C({
            deepDefault: {
                originalKey: 2
            },
            second: {}
        })

        c.writeShallow()
        expect(unbox(c).first).toEqual('')
        expect(c.writeDeep).toThrow()
    })

    test("a service can borrow the same key twice", () => {
        /* since services have their own private scope to write into */
        const C = layerCompose(
            {
                setKey(_) {
                    _.key = 1
                }
            }, {
                service: [{
                    setKey(_) {
                        _.key = 2
                    }
                }]
            })

        const c = C()
        c.setKey()
        c.service.setKey()

        expect(unbox(c).key).toBe(1)
        expect(unbox(c.service).key).toBe(2)
    })

    test("a service cannot modify a key on an object managed by the parent", () => {
        /* since services have their own private scope to write into */
        const C = layerCompose(
            {
                setKey(_) {
                    _.obj.key = 1
                }
            }, {
                service: [{
                    setKey(_) {
                        _.obj.key = 2
                    }
                }]
            })

        const c = C({obj: {}})

        c.setKey()
        expect(unbox(c).obj.key).toBe(1)
        expect(unbox(c.service).obj.key).toBe(1)

        expect(c.service.setKey).toThrow('borrow')
    })

    test("Services carry their own scope", () => {
        const checkMethod = jest.fn()
        const checkBottomService = jest.fn()
        const checkTopService = jest.fn()

        const bottomServices = {
            bottomService: [
                {
                    method(_) {
                        checkBottomService(_.public, _.private)
                    }
                },

                {
                    method(_) {
                        _.private = 'bottom'
                    }
                }

            ]
        }

        const topServices = {
            topService: [
                {
                    method(_) {
                        checkTopService(_.public, _.private)
                    }
                },

                {
                    method(_) {
                        _.private = 'top'
                    }
                }

            ]
        }

        const C = layerCompose(
            topServices, {
                method($, _) {
                    checkMethod(_.public, _.private)
                    $.bottomService.method()
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
