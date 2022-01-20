import * as parser from "@babel/parser"
import traverse    from "@babel/traverse"
import generate    from "@babel/generator"

import fs                   from 'fs'
import path                 from 'path'
import process              from 'process'
import {IS_DEV_MODE}        from "../const"
import prettier             from "prettier"
import {addExportTypes}     from "./addExportTypes"
import {prependFlowComment} from "./prependFlowComment"
const { parse } = parser

const defaultRegex = /^\s*(export\s+default\s+)([^]+)\/\*:\s*any\s*\*\/;/m

function rewriteDefaultExport(source) {
    const matches = defaultRegex.exec(source)
    if (matches && matches[0]) {
        const replaceWith = `${matches[1]}( ${matches[2]} /*: any*/)`
        return source.replace(matches[0], replaceWith)
    }

    return source
}

export function rewriteFileWithTypes({ filename, line: startingLine, types }) {
    // todo make sure it works in browsers
    if (fs && IS_DEV_MODE) {
        const source = fs.readFileSync(filename).toString()
        const isModule = source.includes('import') || source.includes('export')

        const ast = parse(source, { sourceType: isModule && 'module' || 'script' })

        modifyFunctionAstWithType({
            ast, startingLine, types
        })

        const output = generate(ast, {
            retainLines: true,
            compact: false,
            concise: false,
        }, source)

        let updatedSource = prependFlowComment(output.code)
        updatedSource = rewriteDefaultExport(updatedSource)

        const tmpDir = path.join(process.cwd(), 'tmp')

        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir)
        }

        const backupFilename = path.join(tmpDir, filename.replaceAll('/', '_').replaceAll('\\', '_'))
        fs.writeFileSync(backupFilename, source)
        fs.writeFileSync(filename,
            prettier.format(updatedSource, {parser: "babel", semi: false, bracketSpacing: true, semicolons: false, tabWidth: 4})
        )
    }
}

function is$notation(callee) {
    return callee.type === 'Identifier' && callee.name === '$'
}

function isOnotation(callee) {
    return callee.type === 'MemberExpression' && callee.object?.name === 'o' && callee.property?.name === '$'
}

function modifyFunctionAstWithType({ ast, types, startingLine }) {
    return traverse(ast, {
        enter(path) {
            if (path.node.type === 'CallExpression') {
                const callee = path.node.callee
                const is$ = is$notation(callee)
                const isO = !is$ && isOnotation(callee)

                if (is$ || isO) {
                    const line = is$ ? path.node.loc.start.line : path.node.callee.property.loc.end.line

                    if (line === startingLine) {
                        const arg = path.node.arguments[0]
                        if (arg && arg.type === "ObjectExpression") {
                            modifyLayerAstWithType(arg, types)
                        }
                    }
                }
            }

            addExportTypes(path)
        }
    })
}

// let layerId = 0
function modifyLayerAstWithType(ast, functionArgTypes) {
    ast.properties.forEach(prop => {
        if (prop.type === 'ObjectMethod' && prop.key.type === "Identifier") {
            const types = functionArgTypes[prop.key.name]
            if (types) {
                const fnParams = {}
                const sourceParams = prop.params
                fnParams['$'] = sourceParams[0] || (sourceParams[0] = {
                    type: 'Identifier', name: '$'
                })
                fnParams['_'] = sourceParams[1] || (sourceParams[1] = {
                    type: 'Identifier', name: '_'
                })
                fnParams['o'] = sourceParams[2] || (sourceParams[2] = {
                    type: 'Identifier', name: 'o'
                })

                for (const [name, type] of Object.entries(types)) {
                    const param = fnParams[name]
                    if (param) {
                        const line = param?.loc?.end?.line
                        const columnStart = param?.loc?.end?.column + 1
                        param.trailingComments = [
                            {
                                type: 'CommentBlock',
                                value: type + ' ',
                                start: param.start && param.start + 1,
                                end: param.start && param.start + 1 + 4 + type.length + 1,
                                loc: {
                                    start: {
                                        line,
                                        column: columnStart,
                                    },
                                    end: {
                                        line,
                                        column: columnStart + 4 + type.length,
                                    },
                                }

                            }
                        ]
                    }
                }
            }
        }
    })
}
