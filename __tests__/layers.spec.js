import layerCompose from "../src"

describe("Layering", () => {
    test("should have access to data", () => {
        const check = jest.fn()

        const C = layerCompose({
            method(d) {
                check("A", d.key)
            }
        },{
            method(d) {
                check("B", d.key)
            }
        })

        C({key: 'v'}).method()
        expect(check).toHaveBeenCalledWith('A', 'v')
        expect(check).toHaveBeenCalledWith('B', 'v')
    })

    test("layer fragments are composed in proper order", () => {
        let top
        let bottom
        let middle
        const C = layerCompose(
            [{
                top(d) {
                    top = 0
                }
            },
                {
                    top(d) {
                        top = 1
                    },
                    middle() {
                        middle = 0
                    }
                    },

            ],

            [
                {
                    middle() {
                        middle = 1
                    },
                    top() {
                        top = 2
                    },
                },
                {
                    top() {
                        top = 3
                    },
                    bottom() {
                        bottom = 0
                    }
                }
            ]
        )

        const c = C()

        c.top()
        expect(top).toEqual(0)

        c.bottom()
        expect(bottom).toEqual(0)

        c.middle()
        expect(middle).toEqual(0)
    })
})
