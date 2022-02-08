import traverse from "@babel/traverse"
import { modifyLayerAstWithType } from "../modifyLayerAstWithType"
import { addExportTypes } from "../addExportTypes"

export function modifyAstWithType({ ast, types, startingLine }) {
    return traverse(ast, {
        enter(path) {
            if (path.node.type === 'AssignmentExpression') {
                const callee = path.node.callee
                    const line = path.node.loc.start.line

                    if (line === startingLine) {
                        const obj = path.node.right
                        if (obj && obj.type === "ObjectExpression") {
                            modifyLayerAstWithType(obj, types,
                                {containerAst: path.parent, writeLayerHeader: true})
                        }
                    }
            }

            addExportTypes(path)
        }
    })
}

