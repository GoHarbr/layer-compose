import layerCompose from "../src"

describe('Async', () => {
    test('can await a function', async () => {
        const c = layerCompose({
            async func() {
                return {res: true}
            }
        })()

        expect((await c.func()).res).toBe(true)
    })
})
