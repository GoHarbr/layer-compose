import {layerCompose, defaults}   from '../../src'
import SingleUseService from "../../src/external/compositions/SingleUseService"

describe("Services can be re-initialized", () => {
    /*
    * There are use cases where a service should be initialized each time it's accessed
    * In other cases, a service might need to be detached from parent composition and re-initialized at a logical point
    * */

    test("Single use service should be re-initialized each time it's accessed", () => {
        // let's start out with a regular service
        const WithRegularService = layerCompose({
            Service: [
                defaults({val: 1}, /* use an empty {} as the core */true),
                {
                    val: false,
                },
                {
                    inc($,_) {
                        _.val += 1
                    }
                }
            ]
        })

        // each time we access it, we do NOT re-initialize it
        const r = WithRegularService()
        expect(r.Service.val).toBe(1)
        r.Service.inc()
        expect(r.Service.val).toBe(2)
        r.Service.inc()
        expect(r.Service.val).toBe(3)

        // now, let's make it single-use
        const WithSingleUseService = layerCompose({
            Service: [
                SingleUseService
            ]
        },
            WithRegularService
            )

        // each time we access it, we DO re-initialize it
        const su = WithSingleUseService()
        expect(su.Service.val).toBe(1)

        const referenceToService = su.Service
        referenceToService.inc()

        expect(su.Service.val).toBe(1) // each access re-initializes the service, so we start from scratch
        expect(referenceToService.val).toBe(2) // we kept the reference here, so we see the result of `inc`

        su.Service.inc()
        expect(su.Service.val).toBe(1)
    })
})
