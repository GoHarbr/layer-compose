import layerCompose, {unbox} from "../src"

describe('Calling methods', () => {
    test('should have access to `opt`', () => {
        const checkFn = jest.fn()

        const c = layerCompose({
            method(_, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith(opt)
    })

    test('should have access to `opt` (multilayer)', () => {
        expect.assertions(2)

        const opt = {key: 'v'}

        const checkFn = jest.fn()

        const c = layerCompose({
            method(_, opt) {
                expect(opt).toBe(opt)
            }
        }, {
            method(_, opt) {
                checkFn(opt)
            }
        })()

        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith(opt)
    })

    test('should have access to `opt` when called by dependant layer (multilayer)', () => {
        const checkFn = jest.fn()

        const opt = {key: 'v'}
        const c = layerCompose({
            call($, _) {
                $.method({key: _.key})
            }
        }, {
            method(_, opt) {
                expect(opt).toBe(opt)
            }
        }, {
            method(_, opt) {
                checkFn(opt.key)
            }
        })(opt)

        c.call()
        expect(checkFn).toHaveBeenCalledWith(opt.key)
    })

    test('should have access to data when called internally', () => {
        const c = layerCompose({
                call($, _, opt) {
                    _.key = 'v'
                    $.method()
                }
            }, {
                method(_, opt) {
                    expect(_.key).toEqual('v')
                    _.otherkey = _.key
                }
            }
        )()

        c.call()
        const d = unbox(c)
        expect(d.key).toEqual('v')
        expect(d.otherkey).toEqual('v')
    })


    test("getter methods are not called during construction", () => {
        const checkFn = jest.fn()
        const C = layerCompose(
            {
                getMyKey(_) {
                    checkFn()
                    return _.key
                }
            }
        )

        const c = C({key: 'v'})

        expect(checkFn).not.toHaveBeenCalled()

        const k = c.myKey
        expect(k).toBe('v')
    })
})
