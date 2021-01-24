/*
* Records
* layerCompose x 13,666,647 ops/sec ±0.78% (83 runs sampled)
* */

const Benchmark = require('benchmark')
const {default: layerCompose, IS_DEV_MODE} = require('../lib')

console.log('IS_DEV_MODE', IS_DEV_MODE)


var suite = new Benchmark.Suite

function log(tag, what) {
    console.log(tag, what)
}

class A {
    method() {
        log('A', this.key)
    }
}

class B extends A {
    constructor(d) {
        super()
        this.key = d.key
    }

    method() {
        super.method()
        log('B', this.key)
    }
}

const L1 = {
    method() {
        log("B", this.key)
    }
}
const L2 = Object.setPrototypeOf({
    method() {
        super.method()
        log("A", this.key)
    }
}, L1)

function create(d) {
    // return Object.assign(Object.create(L2), d)
    const i = Object.create(L2)
    i.key = d.key
    return i
}

const proto = {
    method1(i, d) {log(d)},
    method(i, d) {log(d); i.method1()},
}

function bind(d) {
    const i = {}
    for (const m in proto) {
        i[m] = () => proto[m](i, d)
    }
    return i
}

const data = {key: 'v'}
new B(data).method()
// C(data).method()
create(data).method()
bind(data).method()

// add tests
suite
    .add('class', function () {
        new B(data)
    })
    .add('create', function () {
        create(data)
    })
    .add('bind', function () {
        bind(data)
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})


// these two are obviously slow
// .add('array', function () {
//     two_array_global()
// })
// .add('frozen array', function () {
//     two_frozenArray_global()
// })
