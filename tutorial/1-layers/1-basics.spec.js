import layerCompose from "../../src"

describe("The basics of Layers", () => {

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

    test("Creating a single layer composition", () => {
        const log = jest.fn((...args) => console.log(...args))

        /**
        * Here we define a single layer, and create a Composition
        * */

        const layer = {
            // you might be wondering what $,_ are -- more on that later
            print($,_) {
                // ah, the classic
                log("Bye, bye, world")
            }
        }

        const C = layerCompose(layer)

        /*
        * Then we create an instance and call our method
        * */

        const instance = C()
        instance.print() // prints Bye, bye, world

        expect(log).toHaveBeenCalledTimes(1)
    })

    test("Multi-layer composition contains functions from all 3 layers", () => {
        const log = jest.fn((...args) => console.log(...args))

        /**
        * Here we define 3 layers, each could live in a separate file
        * */

        const layer1 = {
            print1($,_) {
                log("L1")
            }
        }
        const layer2 = {
            print2($,_) {
                log("L2")
            }
        }
        const layer3 = {
            print3($,_) {
                log("L3")
            }
        }

        /*
        * Compiling all 3 Layers into a Composition
        * */

        const C = layerCompose(layer1, layer2, layer3)

        /*
        * Then we create an instance and call our methods
        * */

        const instance = C()
        instance.print1()
        instance.print2()
        instance.print3()

        expect(log).toHaveBeenCalledTimes(3)
    })

})
