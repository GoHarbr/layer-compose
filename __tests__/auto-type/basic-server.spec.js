import { serverPromise } from "../../src/auto-type/server.js"
import { enableDebug, lc } from "../../src/index"

enableDebug()

describe("Auto-type server", () => {
    test('Starts', async () => {
        await serverPromise
    })

    test('Renders execution diagram', async () => {
        const C = lc()

        C._layer = {
            fn($,_,) {
                console.log('fn')
            },

            Lens: {
                lensFn($,_) {
                    console.log('lens fn')
                }
            }
        }

        await new Promise(res => {
            C(async c => {
                await c.fn()
                await c.Lens(l => l.lensFn().then(res))
            })
        })

        console.log('See output')
        // test output
    })
})
