import express from "express"
import process from "process"
import { functionCallsByName, generateMapTree } from "./mapper/mapper"
import { generateMapFile } from "./mapper/generateMapFile"

let resolveServer
export const serverPromise = new Promise(res => resolveServer = res)

export async function startDevServer() {
    const port = process.env.PORT || 8008
    const app = express()

    app.get('/', (req, res) => {
        res.end(makeMap())
    })


    const server = await new Promise(res => {
        const s = app.listen(port, () => {
            console.log('Express is started on ' + port)

            res(s)
            resolveServer(s)
        })
    })
}

function makeMap() {
    const tree = generateMapTree(functionCallsByName)
    return generateMapFile(tree)
}
