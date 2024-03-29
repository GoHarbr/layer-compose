import * as parser from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator"

import fs from 'fs'
import path from 'path'
import process from 'process'
import { IS_DEV_MODE } from "../../const"
import prettier from "prettier"
import { addExportTypes } from "./addExportTypes"
import { prependFlowComment } from "./prependFlowComment"
import { modifyLayerAstWithType } from "./modifyLayerAstWithType"
// import * as lcAst from "./modifyAstWithType"

const { parse } = parser

const defaultRegex = /^\s*(export\s+default\s+)([^]+)\/\*:\s*any\s*\*\/;/m

function rewriteDefaultExport(source) {
    const matches = defaultRegex.exec(source)
    if (matches && matches[0]) {
        const replaceWith = `${matches[1]}( ${matches[2]} /*: any*/)`
        const updated = source.slice(0, matches.index) + replaceWith + source.slice(matches.index + matches[0].length, source.length)
        return updated
    }

    return source
}

const pendingWrites = []

export function flushTypesToDisk() {
    for (const {filename, ast, original} of pendingWrites) {
        const output = generate(ast, {
            retainLines: true,
            compact: false,
            concise: false,
        })

        let updatedSource = prependFlowComment(output.code)
        updatedSource = rewriteDefaultExport(updatedSource)

        const _filename = path.parse(filename)
        const backupFilename = path.join(_filename.dir, `.${_filename.name}.backup`)
        fs.writeFileSync(backupFilename, original)

        fs.writeFileSync(filename,
            prettier.format(updatedSource, {
                parser: "babel",
                semi: false,
                bracketSpacing: true,
                semicolons: false,
                tabWidth: 4
            })
        )

        fs.rmSync(backupFilename)
    }
}

/*
* Works since rewrite is ran only once: on exit
* */
const cachedAsts = {}

export function rewriteFileWithTypes({ filename, line: startingLine, types }) {
    // todo make sure it works in browsers
    if (fs && IS_DEV_MODE) {
        try {
            let {ast, source} = cachedAsts[filename] || {}

            if (!ast) {
                source = fs.readFileSync(filename).toString()
                const isModule = source.includes('import') || source.includes('export') // todo. fragile

                ast = parse(source, { sourceType: isModule && 'module' || 'script' })
                cachedAsts[filename] = {ast, source}

                const backupDir = path.join(process.cwd(), '.backup')

                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir)
                }

                const backupFilename = path.join(backupDir, filename.replaceAll('/', '_').replaceAll('\\', '_'))

                fs.writeFileSync(backupFilename, source)
            }

            modifyFunctionAstWithType({
                ast, startingLine, types
            })
            modifyAstWithExports(ast)
            // lcAst.modifyAstWithType({
            //     ast, startingLine, types
            // })

            pendingWrites.push({filename, ast, original: source})
        } catch (e) {
            console.error('Failed to write types for file: ', filename, e)
            console.error(updatedSource)
        }
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
                            modifyLayerAstWithType(arg, types, {containerAst: path.node, writeLayerHeader: false})
                        }
                    }
                }
            }
        }
    })
}

function modifyAstWithExports(ast) {
    return traverse(ast, {
        enter: addExportTypes
    })
}
