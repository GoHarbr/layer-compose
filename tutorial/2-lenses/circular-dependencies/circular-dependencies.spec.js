import A from './A'
import B from './B'
import { assign, attach, coreLens, layerCompose, map } from "../../../src/index"

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

        const _A = layerCompose(
            {
                B: [
                    assign(coreLens(coreOfA => {
                        return {console: coreOfA.console}
                    }))
                ]
            },
            A
        )
        const a = _A({ key: 'A', console: testConsole })
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
            serviceB.console = testConsole
            serviceB.sayB()

            expect(testConsole).toHaveBeenCalledWith('B')

            serviceB.A(serviceA => {
                serviceA.console = testConsole
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
                    attach(map(A => {
                        return {A}
                    })),
                ]
            },

            A
        )

        const a = _A({ key: 'A', console: testConsole })
        a.sayKey()
        expect(testConsole).toHaveBeenCalledWith('A')


        a.B(serviceB => {
            serviceB.console = testConsole
            serviceB.sayKey()

            expect(testConsole).toHaveBeenCalledWith(undefined)

            serviceB.A(serviceA => {
                // no need to set console here, should be referencing the orignal A
                serviceA.sayKey()

                expect(testConsole).toHaveBeenCalledWith('A')
                done()
            })
        })
    })

})
