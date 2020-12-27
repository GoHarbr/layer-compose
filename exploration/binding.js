function inner() {
    const _t = this
    console.log('inner', _t)
}

function outer() {
    const _t = this
    console.log('outer', _t)
    inner()
}

inner()
console.log('===')

outer()
console.log('===')

outer.bind({key: 'value'})()
console.log('===')


/* In an object */

let obj = {
    inner() {
        const _t = this
        console.log('inner', _t)
    },

    outer() {
        const _t = this
        console.log('outer', _t)
        obj.inner()
    }
}

obj.inner()
console.log('===')

obj.outer()
console.log('===')

obj.outer.bind({key: 'value'})()
console.log('===')


/* Using `call` or `apply` */

obj = {
    inner() {
        const _t = this
        console.log('inner', _t)
    },

    outer() {
        const _t = this
        console.log('outer', _t)
        obj.inner.apply(this, [])
    }
}

obj.inner()
console.log('===')

obj.outer()
console.log('===')

obj.outer.bind({key: 'value'})()
console.log('===')
