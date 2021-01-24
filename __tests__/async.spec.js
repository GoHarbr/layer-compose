import layerCompose from "../src"

describe('Async', () => {
    test('can await a function (that returns)', async () => {
        const c = layerCompose({
            async func($) {
                return {res: true}
            }
        })()

        expect((await c.func()).res).toBe(true)
    })

    test('can await a multi-layer function (that returns)', async () => {
        const c = layerCompose({
            async func($) {
                return {resTop: true}
            }
        },{
            async func($) {
                return {resBottom: true}
            }
        })()

        const r = await c.func()
        expect(r.resTop).toBe(true)
        // expect(r.resBottom).toBe(true)
    })

    test('can await a function (that does not return)', async () => {
        const c = layerCompose({
            async func($) {}
        })()

        expect(async () => await c.func()).not.toThrow()
    })


    test('can await a multi-layer function (that does not return)', async () => {
        const fn = jest.fn()
        const c = layerCompose({
            async func($) {fn()}
        },{
            async func($) {}
        })()

        expect(async () => await c.func()).not.toThrow()
        expect(fn).toHaveBeenCalled()
    })

    test('can await a multi-layer function (that throws)', async () => {
        const checkCall = jest.fn()
        const checkThrow = jest.fn()
        const checkAwaitThrow = jest.fn()

        const C = layerCompose({
            async func($) {
                checkCall()
                throw new Error()
            }
        },{
            async func($) {}
        })

        const c = C()

        const p = c.func().then(() => console.log('resolved')).catch(e => {
            checkThrow()
        })
        await p
        expect(checkCall).toHaveBeenCalled()
        expect(checkThrow).toHaveBeenCalled()

    })

})
