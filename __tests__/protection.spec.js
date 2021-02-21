import layerCompose, {IS_DEV_MODE} from "../src"
import {wrap$WithProxy}            from "../src/super/generateSuperAccessor"
import {unwrapProxy}               from "../src/proxies/utils"

describe("Protective mechanisms", () => {
    test("should allow for JSON", () => {
        expect.assertions(3)

        const C = layerCompose({
            method(_) {
                expect(_.k).toEqual('v')
                expect(JSON.stringify(unwrapProxy(_))).toEqual('{}')
            }
        })

        const c = C({k: 'v'})
        c.method()
        expect(JSON.stringify(c)).toEqual('{}')
    })

    test("should allow Set & Map to be used normally", () => {
        const set = new Set()

        const C = layerCompose({
            add(_, opt) {
                _.set.add(opt)
            }
        })

        const c = C({set})

        c.add(1)
        expect(set.has(1)).toBeTruthy()
    })

    test("function return values can be set as an internal value and used later", () => {
        const C = layerCompose({
            method($, _) {
                _.key = $.gen()
                const i = _.key[Symbol.iterator]()
                expect(i.next().value).toBe(1)
            }
        }, {
            gen(_) {
                return [1]
            }
        })

        const c = C()
        // fixme. without wrapping into its own function, internal `this` becomes undefined
        expect(() => c.method()).not.toThrow()
    })

    test("function return values can be set as an internal value and used later", () => {
        const C = layerCompose({
            method($, _) {
                const i = _.key[Symbol.iterator]()
                expect(i.next().value).toBe(1)
            }
        }, {
            gen(_) {
                return [1]
            }
        })

        const c1 = C()
        const c2 = C({key: c1.gen()})
        // fixme. without wrapping into its own function, internal `this` becomes undefined

        expect(() => c2.method()).not.toThrow()
    })

    if (IS_DEV_MODE) {

        test("$ should be wrapped to prevent undefined reads and writes", () => {
            const fn = () => {
                return {key: 'v'}
            }

            const $ = wrap$WithProxy(
                {fn}
            )

            expect($.fn).toBeTruthy()
            expect(() => $.nonExistent).toThrow()
            expect(() => $.fn = () => {
            }).toThrow()
        })

        test("Function return values should be protected against writes", () => {
            // noinspection JSUnusedLocalSymbols
            const C = layerCompose({
                make($) {
                    return {key: 'v'}
                }
            })

            const obj = C().make()
            expect(obj.key).toEqual('v')
            expect(() => obj.key = 'z').toThrow()
            expect(() => obj.nonExistent = 'z').toThrow()
        })

        test("Only named options or a single argument are allowed", () => {
            expect.assertions(3)
            const C = layerCompose({
                make($, opt) {
                    expect(opt).toBe('arg')
                }
            })

            const c = C()

            c.make('arg')
            expect(() => c.make('arg1', 'arg2')).toThrow()
            expect(() => c.make({}, 'arg2')).toThrow()
        })


        test("Improper function format should end the whole program", () => {
            expect(() => layerCompose({
                fn() {}
            })).toThrow()
        })

    } else {
        test("Improper function format should not end the whole program", () => {
            const C = layerCompose({
                fn() {}
            })
        })
    }
})
