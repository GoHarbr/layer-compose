import express from "express"
import process from "process"
import { functionCallsByName, generateMapTree } from "./mapper"
import { generateMapFile } from "./generateMapFile"
import { readFileSync, writeFileSync } from 'fs'
import { clearAstCache } from "./getFunctionDetails"

let resolveServer
export const serverPromise = new Promise(res => resolveServer = res)

export async function startDevServer() {
    const port = process.env.LC_PORT || 8008
    const app = express()

    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    app.get('/', (req, res) => {
        res.end(makeMap())
        clearAstCache()
    })

    app.post('/', (req, res) => {
        const {start, end, path, body, body_indent} = req.body
        const file = readFileSync(path).toString()

        let indent = ''
        if (body_indent) {
            while(indent.length < Number(body_indent)) {
                indent += ' '
            }
        }

        let cleanBody = body.trim()
        cleanBody = indent + cleanBody.replaceAll('\n', '\n' + indent)
        cleanBody += '\n'
        const updated = file.slice(0, Number(start)) + cleanBody + file.slice(Number(end) + 1)

        writeFileSync(path, updated)

        res.end(makeMap())
    })


    const server = await new Promise(res => {
        const s = app.listen(port, () => {
            console.log('Layer-compose server started on port ' + port)

            res(s)
            resolveServer(s)
        })
    })
}

function makeMap() {
    const tree = generateMapTree(functionCallsByName)
    return generateMapFile(tree)
}
