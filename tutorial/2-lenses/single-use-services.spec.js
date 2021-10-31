import {layerCompose, defaults, IS_DEV_MODE}   from '../../src'
import SingleUseService from "../../src/external/compositions/SingleUseService"

describe("Services can be re-initialized", () => {
    /*
    * There are use cases where a service should be initialized each time it's accessed
    * In other cases, a service might need to be detached from parent composition and re-initialized at a logical point
    * */

    test("Single use service should be re-initialized each time it's accessed", () => {
        // let's start out with a regular service
        // which is persisted across separate occurrences of access
        const WithRegularService = layerCompose({
            Service: [
                defaults({val: 1}, /* use an empty {} as the core */true),
                {
                    test($,_,opt) {
                        expect(_.val).toBe(opt)
                    },
                    inc($,_) {
                        _.val += 1
                    }
                }
            ]
        })

        // each time we access it, we do NOT re-initialize it
        const r = WithRegularService()
        r.Service(s => {
            s.test(1)
        })
        r.Service(s => {
            s.inc()
            s.test(2)
        })
        r.Service(s => {
            s.inc()
            s.test(3)
        })

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

        let referenceToOldService
        su.Service(s => {
            s.test(1)
            s.inc()
            s.test(2)
            referenceToOldService = s
        })

        su.Service(s => {
            // each access re-initializes the service, so we start from scratch
            s.test(1)
            s.inc()
            s.inc()
            s.test(3)
        })

        referenceToOldService.test(2) // we kept the reference here, so we see the result of `inc`
    })

    /*
    * More detailed tests are here.
    * They are important for code coverage.
    * */

    test("Single use service take only null cores", () => {
        if (!IS_DEV_MODE) {
            return // this check only happens in DEV mode
        }

        const WithSingleUseService = layerCompose({
            Service: [
                SingleUseService
            ]
        })

        expect(() => {
            WithSingleUseService({
                Service: {key: 'val'}
            }).Service(s => {

            })
        }).toThrow()
    })
})


