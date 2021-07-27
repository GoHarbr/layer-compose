import {layerCompose} from '../../src'

describe("The $ and _", () => {
    /*
    * Every function must contain an `$` and `_`, which are special objects
    * $ -- super: it acts just as a `this` acts in a regular JS class instance
    *      all the methods across all layers are accessible with `$`
    * _ -- this is the "state" (or can be referred to as "data" or "core" object)
    *       Compositions are solely created to manage this "state"
    *
    * Note:
    *   Using Compositions when there is no state/data to manage is silly (it's an unnecessary complication)
    * */

    test.each([
        {key: 'val'},
        {hello: true, over: 3},
        {}
    ])("_ gives access the core object", (core) => {
        const C = layerCompose(
            {
                showMeTheData($, _) {
                    for (const k of Object.keys(core)) {
                        expect(_[k]).toEqual(core[k])
                    }
                }
            }
        )

        // the core must always be an object, not a primitive
        const c = C(core)

        c.showMeTheData()
    })

    test("$ gives access the outer interface (of the composition)", () => {
        const core = {testKey: 'v'}
        const testFn = jest.fn(($,_) => {
            if (typeof $.aFunction !== "function") throw new Error("Outer interface is missing a function")
            if (_.testKey !== core.testKey) throw new Error("Core object is missing key/value")
        })

        const C = layerCompose(
            {
                aFunction($, _) {
                    testFn($,_)
                }
            }
        )

        // the core must always be an object, not a primitive
        const c = C(core)

        expect(testFn).not.toHaveBeenCalled()
        c.aFunction()

        expect(testFn).toHaveBeenCalledTimes(1)
    })
})
