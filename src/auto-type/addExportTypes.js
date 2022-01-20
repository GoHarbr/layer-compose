export function addExportTypes(path) {
    const type = path.node.type
    if (type === 'ExportNamedDeclaration') {
        const ds = path.node.declaration?.declarations
        if (ds) {
            for (const d of ds) {
                const i = d.id
                i && addTrailingComment(i)
            }
        }
    } else if (type === 'ExportDefaultDeclaration') {
        const d = path.node.declaration
        if (d) {
            // if (d.type === "CallExpression") {
                // const extra = (d.extra = d.extra || {})
                // extra.parenthesized = true
            // }
            addTrailingComment(d)
        }
    }
}

function addTrailingComment(identifier) {
    const comments = identifier.trailingComments = identifier.trailingComments || []
    // if empty or does not have the flow comment

    if (!comments.length || comments.every(c => !c.value.includes(': any'))) {
        comments.push({
            type: 'CommentBlock', value: ': any'
        })
    }
}
