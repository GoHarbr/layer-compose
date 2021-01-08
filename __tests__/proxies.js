import {wrapDataWithProxy} from "../src/proxies/proxies"

describe("Proxies", () => {
    test("should allow Set & Map to be used normally", () => {
        const s = new Set()
        const ps = wrapDataWithProxy(0, s, {}, {isGetOnly: false})

        ps.add(1)
        expect(s.has(1)).toBeTruthy()
    })
})
