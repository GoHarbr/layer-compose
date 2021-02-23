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

function makeDirect() {
    return {
        m1() {},
        m2() {},
        m3() {},
        m4() {},
        m5() {},
        m6() {},
        m7() {},
        m8() {},
        m9() {},
    }
}

function makeAttach() {
    const o = {}
        o.m1 = function() {}
        o.m2 = function() {}
        o.m3 = function() {}
        o.m4 = function() {}
        o.m5 = function() {}
        o.m6 = function() {}
        o.m7 = function() {}
        o.m8 = function() {}
        o.m9 = function() {}
        return o
}

const c = makeDirect()
function objectCreate() {
    return Object.create(c)
}

// add tests
suite
    .add('makeDirect', function () {
        makeDirect()
    })
    .add('makeAttach', function () {
        makeAttach()
    })
    .add('Object.create', function () {
        objectCreate()
    })

    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
