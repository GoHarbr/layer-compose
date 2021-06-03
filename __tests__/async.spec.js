import layerCompose from "../src"

describe('Async', () => {
    test('can await a getter', async () => {
        const RC = layerCompose({
            inner: true
        })
        const c = layerCompose({
            async getObject($) {
                return {res: true}
            },
            async getValue($,_) {
                return "string"
            },
            async getComposition($,_) {
                return RC({inner: true})
            }
        })()

        expect((await c.value)).toBe("string")
        expect((await c.object).res).toBe(true)
        expect((await c.composition).inner).toBe(true)
    })

    test('can await a getter that uses another', async () => {
        const c = layerCompose({
            async getObject($) {
                return {res: true}
            },
            async getValue($,_) {
                const r = await $.object
                return r.res
            },
        })()

        expect((await c.value)).toBe(true)
    })

    test('can await a getter in a service', async () => {
        const Service = layerCompose({
            async getObject($) {
                return {res: "service"}
            },
            async getValue($,_) {
                const r = await $.object
                return r.res
            },
        })

        const C = layerCompose({
            Service
        })

        const s = C().Service

        expect((await s.value)).toBe("service")
    })

    test('can await a getter in a service that returns a composition', async () => {
        const RC = layerCompose({
            inner: true
        })

        const Service = layerCompose({
            async getObject($) {
                return {res: "service"}
            },
            async getValue($,_) {
                const r = await $.object
                return RC({inner: false})
            },
        })

        const C = layerCompose({
            Service
        })

        const s = C().Service

        expect((await s.value).inner).toBe(false)
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
