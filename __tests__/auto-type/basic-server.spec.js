import { serverPromise } from "../../src/auto-type/server.js"
import { enableDebug } from "../../src/index"
import { TestDiagram } from "../compositions/TestDiagram.layer"

enableDebug()

describe("Auto-type server", () => {
    test('Starts', async () => {
        await serverPromise
    }, 1000 * 60 * 60)

    test('Renders execution diagram', async () => {
        await new Promise(res => {
            TestDiagram(async c => {
                await c.callMeFirst()
                res()
            })
        })

        console.log('See output')
        // test output
    }, 1000 * 60 * 60)
})
