import process from "process"
import path from "path"
import fs from "fs"
import { functionCallsByName, generateMapFile, generateMapTree } from "./mapper/mapper"
import { writeTypesToDisk } from "./trackTypes"
import { GLOBAL_DEBUG } from "../external/utils/enableDebug"

if (GLOBAL_DEBUG.enabled) {
    process.on('exit', onExit)
    process.on('SIGINT', onExit)
    process.on('SIGTERM', onExit)
    process.on('SIGHUP', onExit)

    process.on('SIGUSR2', onExit)
}

let stored = false
function onExit(...args) {
    if (!stored) {
        console.debug("Storing types", ...args)
        const mapFile = path.join(process.cwd(), 'world.mapping.html')

        const tree = generateMapTree(functionCallsByName)
        const contents = generateMapFile(tree)

        fs.writeFileSync(mapFile, contents)

        writeTypesToDisk()

        stored = true

        process.exit()
    }
}
