const dataObject = {
    data: 0
}

const wrapperObject = Object.create(dataObject)

console.assert(dataObject.data === 0, )
console.assert(wrapperObject.data === 0, )

/* Accessing .data from the wrapper should passthough to the underlying */

dataObject.data = 2
console.assert(dataObject.data === 2, )
console.assert(wrapperObject.data === 2, )

/* The wrapper cannot overwrite the underlying */

wrapperObject.data = 1
console.assert(wrapperObject.data === 1, )
console.assert(dataObject.data === 2, )

