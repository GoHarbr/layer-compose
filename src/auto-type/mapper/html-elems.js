import html from 'tagged-template-noop'

function getBucketBySize(fnName) {
    return Math.floor(Math.log2(1 + fnName.length))
}

export function Card(title, layers, functions, childCards) {
    let functionOrder = Object.keys(functions).sort((a, b) => a.localeCompare(b))
    functionOrder = functionOrder.sort((a, b) => getBucketBySize(a) - getBucketBySize(b))

    return `
    <div class='card'>
        <div class="sidebar">
            ${Title(title)}
            <div class="layers">
              ${layers.map(l => Layer(l)).join('')}  
            </div>
            <div class="function-calls">
                ${functionOrder.map(fnName => Function(fnName, functions[fnName])).join('')}    
            </div>
        </div>
        
        <div class="window">
            ${childCards}
        </div>
    </div>
    `
}

function Function(fnName, defs) {
    return html`
        <div class="function-call">
            <div class="function-name">${fnName}</div>
            <div class="function-defs-list">
                ${defs.map(FunctionDef).join('\n')}
            </div>
        </div>
    `
}

function FunctionDef(def) {
    return html`
        <div class="function-def">
            <div class="function-location">${def.filename}</div>
            <div class="function-body">
                <textarea class="code">${def.body}</textarea>
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
