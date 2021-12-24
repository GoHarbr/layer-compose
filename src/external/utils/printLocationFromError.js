export function printLocationFromError(error) {
    return error.stack.split('\n').find(line =>
                    !line.includes('layer-compose')  && line.trim() !== 'Error'
                    && !line.startsWith('node') && line.includes('js')
                )
}
