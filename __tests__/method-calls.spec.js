import layerCompose, {unbox} from "../src"

describe('Calling methods', () => {
    test('should have access to `opt`', () => {
        const checkFn = jest.fn();

        const c = layerCompose({
            method(d, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith(opt)
    })

    test('should have access to `opt` (multilayer)', () => {
        const checkFn = jest.fn();

        const c = layerCompose({
            method(d, opt) {
            }
        }, {
            method(d, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith(opt)
    })

    test('should have access to `opt` when called by dependant layer (multilayer)', () => {
        const checkFn = jest.fn();

        const opt = {key: 'v'}
        const c = layerCompose(({method}) => ({
            call(d) {
                method({key: d.key})
            }
        }),{
            method(d, opt) {
            }
        }, {
            method(d, opt) {
                checkFn(opt.key)
            }
        })(opt)

        c.call()
        expect(checkFn).toHaveBeenCalledWith(opt.key)
    })

    test('should have access to data when called internally', () => {
        const c = layerCompose(({method},d) => {
            d({key: ''})
            return {
                call(d, opt) {
                    d.key = 'v'
                    method()
                }
            }
        }, ($,d) => {
            d({otherkey: ''})
            return {
                method(d, opt) {
                    d.otherkey = d.key
                }
            }
        })()

        c.call()
        const d = unbox(c)
        expect(d.key).toEqual('v')
        expect(d.otherkey).toEqual('v')
    })


    test("getter methods are not called during construction", () => {
        const checkFn = jest.fn()
        const C = layerCompose(
            {
                getMyKey(d) {
                    checkFn()
                    return d.key
                }
            }
        )

        const c = C({key:'v'})

        expect(checkFn).not.toHaveBeenCalled()

        expect(c.myKey).toBe('v')
    })
})
