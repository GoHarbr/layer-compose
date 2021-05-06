import cleanData from "../src/external/utils/cleanData"

describe("External utils", () => {
    test("cleanData", () => {

        const data = {
            a: 1, b: undefined, c: {
                c1: true, c2: null, c3: undefined, c4: {
                    c41: 'string', c42: undefined, c43: [1, undefined, null]
                }
            }
        }

        const clean = cleanData(data)
        expect(clean).toStrictEqual({a: 1, c: {c1: true, c2: null, c4: {c41: 'string', c43: [1, null]}}})
    })
})
