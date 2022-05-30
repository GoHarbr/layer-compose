import html from 'tagged-template-noop'
import crypto from "crypto"

function getBucketBySize(fnName) {
    return Math.floor(Math.log2(1 + fnName.length))
}

export function Card(title, layers, functions, childCards) {
    let functionOrder = Object.keys(functions).sort((a, b) => a.localeCompare(b))
    functionOrder = functionOrder.sort((a, b) => getBucketBySize(a) - getBucketBySize(b))
    functionOrder = functionOrder.sort((a,b) => (a.startsWith('_') && a.length > 1) - (b.startsWith('_') && b.length > 1))

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

function CardMenu() {

}

function Function(fnName, defs) {
    return html`
        <div class="function-call">
            <div class="function-name">${fnName}</div>
            <div class="function-defs-list">
                ${[...defs].reverse().map(FunctionDef).join('\n')}
            </div>
        </div>
    `
}

function FunctionDef(def) {
    if (!def.body) return

    const id = `fnid-${def.layerId}-${def.name}`
    let fn = def.filename.split('/')
    fn = fn[fn.length - 1]

    const keep = 'keep-' + crypto.createHash('sha256').update(def.body, 'utf-8').digest('hex')

    return html`
        <div class="function-def">
            <div class="function-location">
                <a target='_blank' href="file://${def.filename}">${fn}</a>
            </div>
            <div class="function-body">
                <form class="editor" method="post" id="${id}" up-submit>
                    <input type="hidden" name="body_indent" value="${def.bodyIndent}">
                    <input type="hidden" name="start" value="${def.start}">
                    <input type="hidden" name="end" value="${def.end}">
                    <input type="hidden" name="path" value="${def.filename}">
                    <textarea name="body" class="code" up-keep="${keep}">${def.body}</textarea>
                </form>
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
