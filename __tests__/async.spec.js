import layerCompose from "../src"

describe('Async', () => {
    test('can await a function (that returns)', async () => {
        const c = layerCompose({
            async func() {
                return {res: true}
            }
        })()

        expect((await c.func()).res).toBe(true)
    })

    test('can await a function (that does not return)', async () => {
        const c = layerCompose({
            async func() {}
        })()

        expect(async () => await c.func()).not.toThrow()
    })
})
