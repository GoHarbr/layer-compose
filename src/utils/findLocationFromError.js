export function findLocationFromError(error, {shorten} = {}) {
    const errorLine = error.stack.split('\n').find(line => {
            const not = !line.includes('layer-compose') && line.trim() !== 'Error'
                && !line.startsWith('node') && line.includes('js')

            return not || line.includes('.layer.js')
        }
    )

    // if (shorten && errorLine.includes('file://')) {
    //     const {filename } = splitLocationIntoComponents(errorLine)
    //     if (filename) {
    //         const prefixEnd = errorLine.indexOf('/') || 0
    //         return `${errorLine.slice(0, prefixEnd).replace('file:', '')} ${path.relative(process.env.PWD, filename)}`
    //     }
    // }

    return errorLine

}
