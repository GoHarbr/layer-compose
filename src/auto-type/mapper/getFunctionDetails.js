import { findLocationFromError } from "../../utils/findLocationFromError"
import splitLocationIntoComponents from "../../utils/splitLocationIntoComponents"
import fs from "fs"
import traverse from "@babel/traverse"
import * as parser from "@babel/parser"

const { parse } = parser

let astCache = {}

export function clearAstCache() {
    astCache = {}
}

export function getFunctionDetails(fnName, at, pathSegments) {
    pathSegments = pathSegments.filter(s => !!s)
    // necessary for proper traversal to find body in nested definitions
    pathSegments.reverse()

    const loc = findLocationFromError(at)
    if (!loc) debugger

    const { filename, line } = splitLocationIntoComponents(loc)
    const { ast, source } = getAst(filename)
    const { body, start, end, bodyIndent } = getBody(ast, source, fnName, line, pathSegments)

    return { name: fnName, at, filename, body, start, end, bodyIndent}
}

function getAst(filename) {
    let { ast, source } = astCache[filename] || {}

    if (!ast) {
        source = fs.readFileSync(filename).toString()
        const isModule = source.includes('import') || source.includes('export') // todo. fragile

        ast = parse(source, { sourceType: isModule && 'module' || 'script' })
        astCache[filename] = { ast, source }
    }

    return { ast, source }
}

function getBody(ast, source, fnName, line, lensPathSegments) {
    let body = ''
    let start, end
    let lenses = []

    let bodyIndent

    traverse(ast, {
        enter(path) {
            // line can be missing on purpose when traversing nested Lens definitions
            if (path.node.type === 'ObjectExpression' && (!line || path.node.loc.start.line == line)) {
                path.node.properties.forEach(prop => {
                    if ((prop.type === 'ObjectMethod' || prop.value?.type === 'ArrowFunctionExpression') && prop.key.name == fnName) {
                        let bodies = prop.type === 'ObjectMethod' ? prop.body.body : (prop.value.body.body || prop.value.body)
                        bodies = Array.isArray(bodies) ? bodies : [bodies]

                        let b
                        const processedComments = new Set()
                        for (b of bodies) {
                            let indent = ''
                            let char
                            for (let i = b.start - 1; true; i--) {
                                char = source[i]
                                if (char == ' ') {
                                    indent += ' '
                                } else if (char == '\t') {
                                    indent += "    "
                                } else {
                                    break;
                                }
                            }
                            if (!bodyIndent || indent.length < bodyIndent) {
                                bodyIndent = indent.length
                            }

                            if (start == null) start = b.start - indent.length

                            for (const lc of b.leadingComments || []) {
                                const id = `${lc.start}.${lc.end}`
                                if (processedComments.has(id)) continue
                                body += source.slice(lc.start, lc.end) + '\n'
                                processedComments.add(id)
                            }

                            const lines = source.slice(b.start, b.end).split('\n')
                            const sep = lines.length > 1 ? '\n' : ''
                            body += lines[0] + sep + lines.slice(1).map(l => l.slice(indent.length)).join('\n') + '\n'

                            for (const tc of b.trailingComments || []) {
                                const id = `${tc.start}.${tc.end}`
                                if (processedComments.has(id)) continue

                                body += source.slice(tc.start, tc.end) + '\n'
                                processedComments.add(id)
                            }
                        }

                        end = b.end
                    }
                    if (!body && prop.type == 'ObjectProperty' && prop.value.type == 'ObjectExpression'
                        // || (prop.value?.type == 'Identifier' && typeof prop.value.name == 'string' && prop.value.name[0] == prop.value.name[0].toUpperCase())
                    ) {
                        lenses.push({ lensName: prop.key.name, lensLine: prop.loc.start.line })
                    }
                })
            }
        }
    })

    if (!body) {
        for (const { lensLine, lensName } of lenses) {
            if (body) continue

            const i = lensPathSegments.indexOf(lensName)
            if (i > -1) {
                const relativePath = lensPathSegments.slice(0, i + 1)
                const r = getBody(ast, source, fnName, lensLine, relativePath)
                body = r.body
                start = r.start
                end = r.end
                bodyIndent = r.bodyIndent
            }
        }
    }

    return { body, start, end, bodyIndent }
}
