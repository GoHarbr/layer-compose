import {wrapDataWithProxy}  from "../src/proxies/proxies"
import {$dataPointer}       from "../src/const"
import {wrapSuperWithProxy} from "../src/super/wrapSuperWithProxy"

describe("Proxies", () => {
    test("should allow Set & Map to be used normally", () => {
        const s = new Set()
        const ps = wrapDataWithProxy(0, s, {}, {isGetOnly: false})

        ps.add(1)
        expect(s.has(1)).toBeTruthy()
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
})
