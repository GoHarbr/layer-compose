export function prependFlowComment(source) {
    const firstLine = source.slice(0, source.indexOf('\n'))
    if (firstLine.includes('@flow') && firstLine.includes('//')) {
        return source
    } else {
        return '// @flow\n' + source
    }
}
