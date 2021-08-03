import {layerCompose} from '../../src'

/*
* They can have a default preset (which can be used for override-like pattern)
* */

describe("Passing options", () => {

    test("single option", () => {
        /*
        * Options (function arguments) are passed like this
        * */

        const testFn = jest.fn()

        const Composition = layerCompose(
            {
                aFunction($, _, opt) {
                    testFn(opt)
                }
            }
        )

        const singleArgument = /* could be a primitive */ 45

        const instance = Composition()
        instance.aFunction(singleArgument)

        expect(testFn).toHaveBeenCalledWith(singleArgument)
    })

    test("multi-option", () => {
        /*
        * A layer function has only one `opt` argument, thus to pass multiple options/arguments use objects
        * */

        const testFn = jest.fn()

        const Composition = layerCompose(
            {
                aFunction($, _, opt) {
                    testFn(opt.where, opt.when)
                }
            }
        )

        const where = "Chiapas"
        const when = "1994"

        const instance = Composition()
        instance.aFunction({where, when})

        expect(testFn).toHaveBeenCalledWith(where, when)
    })
})
