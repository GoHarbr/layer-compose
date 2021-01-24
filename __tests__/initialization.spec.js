import layerCompose from "../src"

describe("Initialization", () => {
    test("Functions call in initializers are called on initialization", () => {
        const cd = jest.fn()
        const co = jest.fn()
        const cs = jest.fn()

        const C = layerCompose($ => {
            $.methodData()
            $.methodOpt({key: 'opt'})
        },{
            methodData(_) {
                cd(_.key)
            },
            methodOpt($, _, opt) {
                co(opt.key)
                $.subMethod(opt)
            }
        }, {
            subMethod(_, opt) {
                cs(_.key, opt.key)
            }
        })

        C({key:'data'})

        expect(cd).toHaveBeenCalledWith('data')
        expect(co).toHaveBeenCalledWith('opt')
        expect(cs).toHaveBeenCalledWith('data', 'opt')
    })
})
