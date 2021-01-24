/*
* Records
* layerCompose x 660,319,297 ops/sec ±0.58% (89 runs sampled)
* layerCompose x 771,980,180 ops/sec ±1.10% (88 runs sampled)
* layerCompose x 779,712,326 ops/sec ±0.10% (83 runs sampled) --- almost complete
* layerCompose x 778,883,461 ops/sec ±0.11% (85 runs sampled)
* layerCompose x 780,676,204 ops/sec ±0.17% (88 runs sampled) -- Jan 6
* layerCompose x 772,634,425 ops/sec ±0.88% (95 runs sampled) -- Async combine
*
* layerCompose x 783,457,255 ops/sec ±0.16% (86 runs sampled) -- functional / obj.create 71b631c52349e1def65d232c6a72d5c0d5752f23
*
*
* two direct calls x 782,436,428 ops/sec ±0.09% (86 runs sampled)
* layerCompose x 767,648,659 ops/sec ±0.10% (90 runs sampled)
*
* `isAsync`
* two direct calls x 797,096,952 ops/sec ±0.35% (89 runs sampled)
* layerCompose x 783,330,098 ops/sec ±0.41% (90 runs sampled)
*
* two direct calls x 790,056,934 ops/sec ±0.47% (88 runs sampled)
* layerCompose x 785,840,623 ops/sec ±0.39% (88 runs sampled)
*
* two direct calls x 790,134,276 ops/sec ±0.15% (88 runs sampled)
* layerCompose x 775,518,046 ops/sec ±0.42% (88 runs sampled)
* */

const Benchmark = require('benchmark')
const {default: layerCompose, IS_DEV_MODE} = require('../lib')

console.log('IS_DEV_MODE', IS_DEV_MODE)


var suite = new Benchmark.Suite

const data = {key: 'v'}

function log(tag, what) {
    // console.log(tag, what)
    return what
}

function twoLogs_global() {
    log('A', data)
    log('B', data)
}

function twoLogs_this() {
    log('A', this)
    log('B', this)
}

const a = [log, log]
function two_array_global() {
    for (const f of a) {
        f(data)
    }
}

const fa = Object.freeze([log, log])
function two_frozenArray_global() {
    for (const f of fa) {
        f(data)
    }
}

const C = layerCompose({
    method(_) {
        // log("B", _.key)
        log("B", _)
    }
}, {
    method(_) {
        // log("A", _.key)
        log("A", _)
    }
})

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

const c = C(data)
c.method()

const clazz = new B(data)
clazz.method()

// add tests
suite
//     .add('direct global', function () {
//     twoLogs_global()
// })
//     .add('direct this', function () {
//         twoLogs_this.call(data)
//     })
    .add('two direct calls', function () {
        log(data)
        log(data)
    })
    .add('layerCompose', function () {
        c.method()
    })
    .add('class', function () {
        clazz.method()
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
