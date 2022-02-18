'use strict'

const data = {key: 'value'}

const writable = {}

Object.defineProperties(data, Object.fromEntries(
    Object.keys(data).map(key => {
        const v = data[key] // solves call stack exceeded issue
        return [
            key,
            {
                get() {
                    return writable[key] !== undefined ? writable[key] : v
                }
            }
        ]
    })
))

Object.freeze(data)

try {
    data.key = ''
    console.error('freeze failed')
} catch (e) {
    console.log('successfully frozen', e)
}

console.log(data.key) // prints value

writable.key = 'modified'
console.log(data.key) // prints modified
