import path    from "path"
import process from "process"

process.on('exit', onExit());

//catches ctrl+c event
process.on('SIGINT', onExit());

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', onExit());
process.on('SIGUSR2', onExit());

function onExit() {
    const mapFile = path.join(process.cwd(), 'world-map.html')


}

const functionCallsByName = {}

function addCall(cname, fnname) {
    const record = functionCallsByName[cname] = functionCallsByName[cname] ||  []

    record.push(fnname)
}
export function trackFunctionCall(fullyQualifiedName, functionName) {
    addCall(fullyQualifiedName, functionName)
}

function generateMapTree(functionCallsByName) {
    const mapTree = {}

    function modifyTreePath(col, row, elemGenerator) {
        let column = mapTree[col]
        if (!column) {
            column = []
        }
        column[row] = elemGenerator(column[row] || null)
    }

    for (const compositionFqName of Object.keys(functionCallsByName)) {
        const pathFragments = compositionFqName.split('.')

        let branch = mapTree
        for (let i = 0; i < pathFragments.length; i++) {
            const fragment = pathFragments[i]
            branch = branch[fragment] = branch[fragment] || {__functions: new Set()}
        }

        branch.functions.add()
    }
}

function generateMapFile(tree) {

}
