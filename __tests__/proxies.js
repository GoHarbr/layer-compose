import {wrapDataWithProxy}  from "../src/proxies/proxies"
import {$dataPointer}       from "../src/const"
import {wrapSuperWithProxy} from "../src/super/wrapSuperWithProxy"
import layerCompose         from "../src"

describe("Proxies", () => {
    test("should allow Set & Map to be used normally", () => {
        const s = new Set()
        const ps = wrapDataWithProxy(0, s, {}, {isGetOnly: false})

        ps.add(1)
        expect(s.has(1)).toBeTruthy()
    })

    test("should allow arrays to be accessible when multi-wrapped", () => {
        const a = [1]
        const firstWrap = wrapDataWithProxy(0, a, {}, {isGetOnly: false})
        const secondWrap = wrapDataWithProxy(0, firstWrap, {}, {isGetOnly: false})

        const res = secondWrap.map(_ => _ * 2)
        expect(res[0]).toBe(2)

        const iter = secondWrap[Symbol.iterator]()
        const n = iter.next().value
        expect(n).toBe(1)
    })

    test("function return values should be wrapped to prevent undefined reads and writes", () => {
        const fn = () => {
            return {key: 'v'}
        }

        const $ = wrapSuperWithProxy(
            {fn}, {
                pointer: {
                    [$dataPointer]: {},
                    fn
                }
            }
        )

        const res = $.fn()
        expect(res.key).toEqual('v')
        expect(() => res.notPresent).toThrow()
        expect(() => res.key = 'a').toThrow()
    })

    test("function return values can be set as data and used later", () => {
        const C = layerCompose(({gen}, d) => {
            d({key: null})
            return {
                method(d) {
                    d.key = gen()
                    const i = d.key[Symbol.iterator]()
                    expect(i.next().value).toBe(1)
                }
            }
        }, {
            gen() {
                return [1]
            }
        })

        const c = C()
        expect(c.method).not.toThrow()
    })

})
