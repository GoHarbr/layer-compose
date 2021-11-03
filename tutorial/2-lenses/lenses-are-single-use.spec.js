import {layerCompose, defaults, IS_DEV_MODE, memo, assign, coreLens, replace} from '../../src'

describe("Lenses are instantiated on each access", () => {
    /*
    * There are use cases where a lens should be initialized each time it's accessed
    * In other cases, a lens might need to be detached from parent composition and re-initialized at a logical point
    * */

    // let's start out with a regular lens
    // which is persisted across separate occurrences of access
    const WithRegularLens = layerCompose({
        Lens: [
            defaults({val: 1}),
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

    test("Lenses are initialized each time they are accessed", () => {
        // each time we access the Lens, we do re-initialize it
        const r = WithRegularLens()
        r.Lens(s => {
            s.test(1)
        })
        r.Lens(s => {
            s.inc()
            s.test(2)
        })
        r.Lens(s => {
            s.inc()
            s.test(2) // does not keep state!
        })
    })

    test("A lens can memoize data on its parent", () => {

        // now, let's make it single-use
        const WithSingleUseLens = layerCompose({
                Lens: [
                    replace(memo({}))
                ]
            },
            WithRegularLens
        )

        const su = WithSingleUseLens()

        su.Lens(s => {
            s.test(1)
            s.inc()
            s.test(2)
        })

        // each time we access it, even though the lens is re-initialized,
        // we take the memoized data thus the state is stored
        su.Lens(s => {
            s.test(2)
            s.inc()
            s.inc()
            s.test(4)
        })
    })
})


