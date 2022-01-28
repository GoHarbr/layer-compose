import path                        from "path"
import process                     from "process"
import fs                          from "fs"
import {retrieveLayer}             from "../../compose/registerLayer"
import {$composition, $layerOrder} from "../../const"

const functionCallsByName = {}


function addRecord(cname, fnName, layerIds) {
    cname = cname || ''
    const record = functionCallsByName[cname] = functionCallsByName[cname] || []

    record.push({ fnName, layerIds })
}

export function trackExternalFunctionCall(fullyQualifiedName, functionName, compositionId) {
    const layer = retrieveLayer(compositionId) // should be pointing to the constructor
    const layerIds = layer[$composition][$layerOrder]

    addRecord(fullyQualifiedName, functionName, layerIds)
}

const __functions = Symbol('functions')
const __layers = Symbol('layers')
const __meta = Symbol('meta')

export function generateMapTree(functionCallsByName) {
    const mapTree = {}

    const distinctCompositionChains = Object.keys(functionCallsByName)
    for (const compositionFqName of distinctCompositionChains) {
        const pathFragments = compositionFqName.split('.')

        let pointer = ''
        let branch = mapTree
        for (let i = 0; i < pathFragments.length; i++) {
            const fragment = pathFragments[i]
            pointer += "." + fragment
            branch = branch[fragment] = branch[fragment] || {
                [__meta]: {
                    pointer
                },
                [__functions]: new Set(),
                [__layers]: new Set()
            }
        }

        const logOfCalls = functionCallsByName[compositionFqName]

        const distinctFunctions = branch[__functions]
        const distinctLayers = branch[__layers]
        for (const record of logOfCalls) {
            const { fnName, layerIds } = record

            distinctFunctions.add(fnName)
            layerIds.forEach(l => distinctLayers.add(l))
        }
    }

    return mapTree
}

export function generateMapFile(tree) {
    return `
        ${generateMapCard(tree)}
    
        <style>
            .layers, .card, .function-calls {
                display: flex;
            }
            
            /* todo remove*/
            .layers {
                display: none;
            }
            
            .card {
                margin-bottom: 1em;
            }
            .card .title {
                font-size: 1.2em;
            }
            .card .title .name {
                font-weight: bold;
                padding: 0.3em;
            }
            .card .title .breadcrumbs {
                display: none;
            }

            
            .sidebar {
                background-color: #C37AFF0A;
                width: 25%;
                min-width: 250px;
                max-width: 400px;
                border-left: 1px solid #7933B260;
            }
            .window {
                padding: 1em;
            }
            
            
            .function-calls {
                padding: 0.5em 0.5em 0.5em 1em;
                flex-direction: column;
            }
            .layer, .function-call {
                background-color: white;
                border-bottom: 1px solid lightgray;
                margin-bottom: 1em;
            }
            .function-call {
                margin-bottom: 0.3em;
                width: 100%;
            }
        </style>
    `
}

function generateMapCard(subtree) {
    const cards = []

    for (const [name, v] of Object.entries(subtree)) {
        const layers = Array.from(v[__layers]).map(retrieveLayer).map(l => l[$composition] || l)

        const title = { segments: v[__meta].pointer.split('.') }
        const card = Card(title, layers, Array.from(v[__functions]), generateMapCard(v))
        cards.push(card)
    }

    return cards.join('')
}

function getBucketBySize(fnName) {
    return Math.floor(Math.log2(1 + fnName.length))
}

function Card(title, layers, extFunctions, childCards) {
    extFunctions = extFunctions.sort((a, b) => a.localeCompare(b))
    extFunctions = extFunctions.sort((a, b) => getBucketBySize(a) - getBucketBySize(b))
    return `
    <div class='card'>
        <div class="sidebar">
            ${Title(title)}
            <div class="layers">
              ${layers.map(l => Layer(l)).join('')}  
            </div>
            <div class="function-calls">
                ${extFunctions.map(fnName => `<div class="function-call">${fnName}</div>`).join('')}    
            </div>
        </div>
        
        <div class="window">
            ${childCards}
        </div>
    </div>
    `
}

function Layer(l, extFunctions) {
    return `
    <div class='layer'>
        ${
        Object.keys(l).map(fnName => `<div class="function">${fnName}</div>`)
    }
    </div>
    `
}

function Title(t) {
    const { segments } = t
    const name = segments[segments.length - 1]
    const breadcrumbs = segments.slice(0, segments.length - 1)
    return `
<div class="title">
    <div class="breadcrumbs">${breadcrumbs}</div>
    <div class="name">${name}</div>
</div>`
}
