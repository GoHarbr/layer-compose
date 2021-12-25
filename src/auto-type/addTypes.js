import {findLocationFromError}     from "../external/utils/findLocationFromError"
import splitLocationIntoComponents from "../external/utils/splitLocationIntoComponents"
import {parse}                     from "@babel/parser"
import traverse                    from "@babel/traverse"
import generate                    from "@babel/generator"

import fs            from 'fs'
import path            from 'path'
import process            from 'process'
import {IS_DEV_MODE} from "../const"

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

        const updatedSource = prependFlowComment(output.code)
        const tmpDir = path.join(process.cwd(), 'tmp')

        if (!fs.existsSync(tmpDir)){
            fs.mkdirSync(tmpDir);
        }

        const backupFilename = path.join(tmpDir, filename.replaceAll('/','_').replaceAll('\\', '_') )
        fs.writeFileSync(backupFilename, source)
        fs.writeFileSync(filename, updatedSource)
    }
}

// export function addTypesFromError(error) {
//     const loc = findLocationFromError(error)
//     const locComponents = splitLocationIntoComponents(loc)
//
//     return rewriteFileWithTypes(locComponents)
// }

function prependFlowComment(source) {
    const firstLine = source.slice(0, source.indexOf('\n'))
    if (firstLine.includes('@flow') && firstLine.includes('//')) {
        return source
    } else {
        return '// @flow\n' + source
    }
}

function modifyFunctionAstWithType({ ast, types, startingLine }) {
    return traverse(ast, {
        enter(path) {
            if (path.node.type === 'CallExpression') {
                const callee = path.node.callee
                if (callee.type === 'Identifier'
                    && callee.name === '$'
                    && path.node.loc.start.line === startingLine) {

                    const arg = path.node.arguments[0]
                    if (arg && arg.type === "ObjectExpression") {
                        modifyLayerAstWithType(arg, types)
                    }
                }
            }
        }
    })
}

// let layerId = 0
function modifyLayerAstWithType(ast, functionArgTypes) {
    // traverse(ast, {
    //     enter() {

            ast.properties.forEach(prop => {
                if (prop.type === 'ObjectMethod' && prop.key.type === "Identifier") {
                    const types = functionArgTypes[prop.key.name]
                    if (types) {
                        const fnParams = {}
                        prop.params.forEach(p => fnParams[p.name] = p)
                        fnParams['o'] = prop.params[3]

                        for (const [name, type] of Object.entries(types)) {
                            const param = fnParams[name]
                            if (param) {
                                const line = param.loc.end.line
                                const columnStart = param.loc.end.column + 1
                                param.trailingComments = [
                                    {
                                        type: 'CommentBlock',
                                        value: type,
                                        start: param.start + 1,
                                        end: param.start + 1 + 4 + type.length,
                                        loc: {
                                            start: {
                                                line,
                                                column: columnStart,
                                            },
                                            end:  {
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
        // }
    // })
}
