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
                await c.fn()
                await c.Lens(l => l.lensFn().then(res))
            })
        })

        console.log('See output')
        // test output
    }, 1000 * 60 * 60)
})
