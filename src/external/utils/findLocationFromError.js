export function findLocationFromError(error) {
    return error.stack.split('\n').find(line => {
            const not = !line.includes('layer-compose') && line.trim() !== 'Error'
                && !line.startsWith('node') && line.includes('js')

            return not || line.includes('.spec.js')
        }
    )
}
