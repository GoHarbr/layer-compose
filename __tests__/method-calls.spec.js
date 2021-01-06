import layerCompose from "../src"

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
                method(d.key)
            }
        }),{
            method(d, opt) {
            }
        }, {
            method(d, opt) {
                checkFn(opt)
            }
        })(opt)

        c.call()
        expect(checkFn).toHaveBeenCalledWith(opt.key)
    })

    test('should have access to `opt` (defaults; prepend)', () => {
        const checkFn = jest.fn();

        const c = layerCompose($ => {
            $.method.defaultOpt({default: 'default', key: 'default'})
        }, {
            method(d, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith({key: 'v', default: 'default'})
    })

    test('should have access to `opt` (overwrites; append)', () => {
        const checkFn = jest.fn();

        const c = layerCompose($ => {
            $.method.overwriteOpt({default: 'default', key: 'default'})
        }, {
            method(d, opt) {
                checkFn(opt)
            }
        })()

        const opt = {key: 'v', otherKey: 'v'}
        c.method(opt)
        expect(checkFn).toHaveBeenCalledWith({otherKey: 'v', key: 'default', default: 'default'})
    })
})
