const { serverPromise } = require("../../src/auto-type/server.js")
const { enableDebug } = require("../../src/index")
const { TestDiagram } = require("../compositions/TestDiagram.layer")

enableDebug()

const main = (async res => {
    await serverPromise

    TestDiagram(async c => {
        await c.callMeFirst()
        res()
    })
})

main()
