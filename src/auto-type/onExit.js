import process from "process"
import path from "path"
import fs from "fs"
import { functionCallsByName, generateMapTree } from "./mapper/mapper"
import { writeTypesToDisk } from "./trackTypes"
import { flushTypesToDisk } from "./addTypes"
import { GLOBAL_DEBUG } from "../utils/enableDebug"
import { generateMapFile } from "./mapper/generateMapFile"

export function enableTypeStorage() {
    process.on('exit', onExit)
    process.on('SIGINT', onExit)
    process.on('SIGTERM', onExit)
    process.on('SIGHUP', onExit)

    process.on('SIGUSR2', onExit)
}

let stored = false

function onExit(...args) {
    if (!stored) {
        stored = true

        console.debug("Storing types", ...args)
        const mapFile = path.join(process.cwd(), 'world.mapping.html')

        const tree = generateMapTree(functionCallsByName)
        const contents = generateMapFile(tree)

        fs.writeFileSync(mapFile, contents)


        if (GLOBAL_DEBUG.writeTypes) {
            writeTypesToDisk()
            flushTypesToDisk()
        }

        process.exit()
    }
}
