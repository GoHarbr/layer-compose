// let layerId = 0
export function modifyLayerAstWithType(ast, functionArgTypes, {suffix = "", containerAst, writeLayerHeader} = {}) {

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

    if (writeLayerHeader) {
        const leadingComments = containerAst.leadingComments = containerAst.leadingComments || []

        if (!leadingComments.some(c => c.value.includes("*** Layer"))) {
            const value = '* \n *** Layer\n'
            const end = containerAst.start - 1
            const start = end - value.length
            const loc = {
                start: {line: containerAst.loc.start.line - 3, column: 0},
                end: {line: containerAst.loc.start.line - 1, column: 1},
            }
            containerAst.leadingComments.push({ type: 'CommentBlock', value, start, end, loc })
        }
    }
}
