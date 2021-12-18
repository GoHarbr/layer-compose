import {layerCompose} from "../../src"

describe("Borrow checks", () => {

    /*
    * Layers are Plain Old Javascript Objects (POJO) that contain function definitions
    * Layers are combined into Compositions
    * Compositions are very similar to regular JS class definitions
    * */

    /*
    * Note:
    * The examples that follow do not manage state
    * LayerCompose is meant to be used to manage state
    * More realistic use cases follow in this Tutorial series
    * */

    test("Within the same composition", done => {
        const log = jest.fn((...args) => console.log(...args))

        /**
         * Here we define a single layer, and create a Composition
         * */

        const layer1 = {
            // you might be wondering what $,_ are -- more on that later
            set($, _) {
                _.value = 1
            }
        }

        const layer2 = {
            // you might be wondering what $,_ are -- more on that later
            set($, _) {
                _.value = 2
            }
        }


        const C = layerCompose(layer2, layer1)


        C({}, async instance => {
            await expect(async () => {
                instance.set()
                await instance
            }).rejects.toThrow()

            done()
        })


    })

})
