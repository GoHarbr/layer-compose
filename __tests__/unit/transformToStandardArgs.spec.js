import transformToStandardArgs from "../../src/compose/transformToStandardArgs"

describe('Providing the right arguments to function definitions in the right order', () => {
    test('should not modify function with all 3 arguments', () => {
        const check = jest.fn()
        const fn = ($, _, opt) => check($,_,opt)

        const tfn = transformToStandardArgs(fn)
        tfn('$', '_', 'opt')

        expect(check).toHaveBeenCalledWith('$', '_', 'opt')
    })

    test('should work with (_, `opt`)', () => {
        const check = jest.fn()
        function fn(_, opt) {check(_,opt)}

        const tfn = transformToStandardArgs(fn)
        tfn('$', '_', 'opt')

        expect(check).toHaveBeenCalledWith('_', 'opt')
    })

    test('should work with ($, `opt`)', () => {
        const check = jest.fn()
        function fn($, opt) {check($,opt)}

        const tfn = transformToStandardArgs(fn)
        tfn('$', '_', 'opt')

        expect(check).toHaveBeenCalledWith('$', 'opt')
    })

    test('single $ arg', () => {
        const check = jest.fn()
        const fn = $ => check($)

        const tfn = transformToStandardArgs(fn)
        tfn('$', '_', 'opt')

        expect(check).toHaveBeenCalledWith('$')
    })

    test('single _ arg', () => {
        const check = jest.fn()
        const fn = _ => check(_)

        const tfn = transformToStandardArgs(fn)
        tfn('$', '_', 'opt')

        expect(check).toHaveBeenCalledWith('_')
    })

    test('only `opt` arg', () => {
        const fn = opt => {}

        expect(() => {
            const tfn = transformToStandardArgs(fn)
        }).toThrow()
    })

    test('no args', () => {
        const fn = () => {}

        expect(() => {
            const tfn = transformToStandardArgs(fn)
        }).toThrow()
    })

    test('reversed $, _', () => {
        function fn (_, $) {}

        expect(() => {
            transformToStandardArgs(fn)
        }).toThrow()
    })

    test('`opt` out of order (2 param) ', () => {
        function fn (opt, $) {}

        expect(() => {
            transformToStandardArgs(fn)
        }).toThrow()
    })

    test('`opt` out of order (3 param)', () => {
        function fn (opt, $, _) {}

        expect(() => {
            transformToStandardArgs(fn)
        }).toThrow()
    })
})
