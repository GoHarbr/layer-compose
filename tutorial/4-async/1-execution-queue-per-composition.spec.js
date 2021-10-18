import {layerCompose} from '../../src'

describe("Execution queues and async handling", () => {
    test("Functions execute serially within a single Composition", (done) => {
        const orderFn = jest.fn()

        const Composition = layerCompose(
            {
                async startDownload($,_,opt) {
                    orderFn(1)
                    await new Promise(onFulfilled => setTimeout(onFulfilled, 1))
                    orderFn(2)
                },
                onEndDownload($,_,opt) {
                    orderFn(4)
                },

                /*
                * Note no `async` at the beginning!!
                * And yet the execution order is preserved!
                * */

                download($,_,opt) {
                    $.startDownload()
                    $.onEndDownload()
                }
            }, {
                onEndDownload($,_,opt) {
                    orderFn(3)
                }
            }
        )

        const c = Composition().download()

        c.then(() => {
            expect(orderFn).toHaveBeenNthCalledWith(1, 1)
            expect(orderFn).toHaveBeenNthCalledWith(2, 2)
            expect(orderFn).toHaveBeenNthCalledWith(3, 3)
            expect(orderFn).toHaveBeenNthCalledWith(4, 4)
            done()
        })
    })
})
