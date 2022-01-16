import path    from "path"
import process from "process"
import fs      from "fs"

process.on('exit', onExit());

//catches ctrl+c event
process.on('SIGINT', onExit());

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', onExit());
process.on('SIGUSR2', onExit());

const functionCallsByName = {}

function onExit() {
    const mapFile = path.join(process.cwd(), 'world.mapping.html')

    const tree = generateMapTree(functionCallsByName)
    const contents = generateMapFile(tree)

    fs.writeFileSync(mapFile, contents)
}


function addRecord(cname, fnName, layerIds) {
    const record = functionCallsByName[cname] = functionCallsByName[cname] ||  []

    record.push({fnName, layerIds})
}
export function trackExternalFunctionCall(fullyQualifiedName, functionName, layerIds) {
    addRecord(fullyQualifiedName, functionName, layerIds)
}

function generateMapTree(functionCallsByName) {
    const mapTree = {}

    const distinctCompositionChains = Object.keys(functionCallsByName)
    for (const compositionFqName of distinctCompositionChains) {
        const pathFragments = compositionFqName.split('.')

        let branch = mapTree
        for (let i = 0; i < pathFragments.length; i++) {
            const fragment = pathFragments[i]
            branch = branch[fragment] = branch[fragment] || {__functions: new Set(), __layers: new Set()}
        }

        const logOfCalls = functionCallsByName[compositionFqName]

        const distinctFunctions = branch.__functions
        const distinctLayers = branch.__layers
        for (const record of logOfCalls) {
            const {fnName, layerIds} = record

            distinctFunctions.add(fnName)
            layerIds.forEach(l => distinctLayers.add(l))
        }
    }

    debugger

    return mapTree
}

function generateMapFile(tree) {

}
