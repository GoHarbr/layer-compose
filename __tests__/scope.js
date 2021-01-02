import layerCompose         from "../src"
import {getDataFromPointer} from "../src/utils"

describe("Scope", () => {
    test.skip("can be narrowed", () => {
        // layerCompose(DataManager.pickData(d => d.must_be_an_object))
    })

    test("can have defaults set (deep)", () => {
        const C = layerCompose(({d}) => {
            d({
                defaultKey: 'defaultValue',
                deepDefault: {
                    defaultKey: 1
                }
            })
            return {}
        })

        const c = C({
            deepDefault: {
                originalKey: 2
            }
        })
        expect(getDataFromPointer(c).deepDefault.originalKey).toEqual(2)
        expect(getDataFromPointer(c).deepDefault.defaultKey).toEqual(1)
        expect(getDataFromPointer(c).defaultKey).toEqual('defaultValue')

        console.log(getDataFromPointer(c))
    })

    test.skip("can be borrowed", () => {
        const C = layerCompose(({d}) => {
            d({
                defaultKey: 'defaultValue',
                deepDefault: {
                    key: 1
                }
            })
            return {}
        })

        const c = C({
            deepDefault: {
                originalKey: 2
            }
        })
        expect()
        console.log(getDataFromPointer(c))
    })
})
