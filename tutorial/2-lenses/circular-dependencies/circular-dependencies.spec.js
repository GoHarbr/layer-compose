import A              from './A'
import B              from './B'
import {layerCompose} from "../../../src"
import {transform}    from "../../../src"

describe("Circular dependencies, where a Composition mutually rilies on one another are possible", () => {
    // This is achieved through async `import`
    // See `A.js` and `B.js`

    test("A should be able to initialize and run", () => {
        const testConsole = jest.fn((...v) => console.log(...v))

        const a = A({ key: 'A', console: testConsole })
        a.sayA()

        expect(testConsole).toHaveBeenCalledWith('A')
    })

    test("B should be able to initialize and run", () => {
        const testConsole = jest.fn((...v) => console.log(...v))

        const b = B({ key: 'B', console: testConsole })
        b.sayB()

        expect(testConsole).toHaveBeenCalledWith('B')
    })

    test("A should be able to access B", (done) => {
        const testConsole = jest.fn((...v) => console.log(...v))

        const a = A({ key: 'A', console: testConsole })
        a.B(serviceB => {
            serviceB.sayB()

            expect(testConsole).toHaveBeenCalledWith('B')
            done()
        })
    })

    test("A -- B -- A", (done) => {
        const testConsole = jest.fn((...v) => console.log(...v))

        const a = A({ key: 'A', console: testConsole })
        a.B(serviceB => {
            serviceB.sayB()

            expect(testConsole).toHaveBeenCalledWith('B')

            serviceB.A(serviceA => {
                serviceA.sayA()
                expect(testConsole).toHaveBeenCalledWith('A')
                done()
            })
        })
    })

    test("A -- B -- A where B keeps reference to original A", (done) => {
        const testConsole = jest.fn((...v) => console.log(...v))

        const _A = layerCompose(
            {
                B: [
                    // taking the parent (which is A)
                    // and assigning it at runtime to instance of B
                    $ => $(parent => ({ A: parent })),
                ]
            },
            // for test purposes
            // making sure that the `key` is not passed along
            transform(core => {
                // when service `B` instantiates, it will read it's core from A's core through `_.B`
                core.B = { console: core.console }
            }),

            A
        )

        const a = _A({ key: 'A', console: testConsole })
        a.sayKey()
        expect(testConsole).toHaveBeenCalledWith('A')


        a.B(serviceB => {
            serviceB.sayKey()

            expect(testConsole).toHaveBeenCalledWith(undefined)

            serviceB.A(serviceA => {
                serviceA.sayKey()

                expect(testConsole).toHaveBeenCalledWith('A')
                done()
            })
        })
    })

})
