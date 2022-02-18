/*
* Records
* layerCompose x 13,666,647 ops/sec ±0.78% (83 runs sampled)
*
* create x 765,278,046 ops/sec ±0.60% (81 runs sampled)
* layerCompose x 757,356,319 ops/sec ±0.55% (88 runs sampled)
*
* create x 778,729,132 ops/sec ±0.33% (82 runs sampled)
* layerCompose x 766,059,702 ops/sec ±0.35% (90 runs sampled)
*
* create x 793,497,593 ops/sec ±0.32% (87 runs sampled)
* layerCompose x 780,638,982 ops/sec ±0.39% (91 runs sampled)
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
        log("crB", this.key)
    }
}
const L2 = Object.setPrototypeOf({
    method() {
        super.method()
        log("crA", this.key)
    }
}, L1)

const L3 = Object.setPrototypeOf({
    method() {
        super.method()
        log("crC", this.key)
    }
}, L1)

function create(d) {
    // return Object.assign(Object.create(L2), d)
    const i = Object.create(L2)
    i.key = d.key
    return i
}

function create2(d) {
    const i = Object.create(L2)
    // i.key2 = d.key2
    Object.assign(i, d)
    return i
}

const C = layerCompose({
    method(_) {
        log("lcB", _.key)
    }
}, {
    method(_) {
        log("lcA", _.key)
    }
})

const C2 = layerCompose({
    partial_method(_) {
        log("lpA", _.key)
    }
},
    {
    partial_method(_) {
        log("lpB", _.key)
    }
}
)


const data = {key: 'v'}
const data2 = {key2: 'v2'}

create(data).method()
create2(data).method()

// C(data).method()

// new B(data).method()
// C2(data).partial_method()

// add tests
suite
    // .add('class (1)', function () {
    //     new B(data)
    // })
    // .add('class (1)', function () {
    //     new B(data2)
    // })
    // .add('create (direct set)', function () {
    //     create(data)
    // })
    // .add('create (assign)', function () {
    //     create2(data2)
    // })
    .add('layerCompose (1)', function () {
        C(data)
    })
    .add('layerCompose (2)', function () {
        // C_partial(data, C_L2)
        C2(data2)
    })
    .add('layerCompose (1)', function () {
        C(data2)
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
