import { findLocationFromError } from "../../utils/findLocationFromError"
import splitLocationIntoComponents from "../../utils/splitLocationIntoComponents"
import fs from "fs"
import traverse from "@babel/traverse"
import * as parser from "@babel/parser"

const { parse } = parser

const astCache = {}

export function getFunctionDetails(fnName, at, pathSegments) {
    pathSegments = pathSegments.filter(s => !!s)
    // necessary for proper traversal to find body in nested definitions
    pathSegments.reverse()

    const loc = findLocationFromError(at)
    if (!loc) debugger

    const { filename, line } = splitLocationIntoComponents(loc)
    const {ast, source} = getAst(filename)
    const body = getBody(ast, source, fnName, line, pathSegments)

    return { name: fnName, at, filename, body }
}

function getAst(filename) {
    let { ast, source } = astCache[filename] || {}

    if (!ast) {
        source = fs.readFileSync(filename).toString()
        const isModule = source.includes('import') || source.includes('export') // todo. fragile

        ast = parse(source, { sourceType: isModule && 'module' || 'script' })
        astCache[filename] = { ast, source }
    }

    return {ast, source}
}

function getBody(ast, source, fnName, line, lensPathSegments) {
    let body = ''
    let lenses = []

    traverse(ast, {
        enter(path) {
            // line can be missing on purpose when traversing nested Lens definitions
            if (path.node.type === 'ObjectExpression' && (!line || path.node.loc.start.line == line)) {
                path.node.properties.forEach(prop => {
                    if (prop.type === 'ObjectMethod' && prop.key.name == fnName) {
                        for (const b of prop.body.body) {
                            body += source.slice(b.start, b.end) + '\n'
                        }
                    }
                    if (!body && prop.type == 'ObjectProperty' && prop.value.type == 'ObjectExpression') {
                        lenses.push({lensName: prop.key.name, lensLine: prop.loc.start.line})
                    }
                })
            }
        }
    })

    if (!body) {
        for (const {lensLine, lensName} of lenses) {
            if (body) continue

            const i = lensPathSegments.indexOf(lensName)
            if (i > -1) {
                const relativePath = lensPathSegments.slice(0, i + 1)
                body = getBody(ast, source, fnName, lensLine, relativePath)
            }
        }
    }

    return body
}
