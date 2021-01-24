/*
* Records
* layerCompose x 13,666,647 ops/sec ±0.78% (83 runs sampled)
* */

const Benchmark = require('benchmark')
const {default: layerCompose, IS_DEV_MODE} = require('../lib')

console.log('IS_DEV_MODE', IS_DEV_MODE)


var suite = new Benchmark.Suite

function log(tag, what) {
    // console.log(tag, what)
}

const $_direct = {
    log() {
        log('$direct')
    }
}

function abs_direct() {
    log('abs')
}
function direct_obj($) {
    $.log()
}

function indirect(self) {
    const $ = {
        log: self.log
    }
    $.log()
}

const $_iter = {}
for (const m in $_direct) {
    $_iter[m] = function() {
        return this.$[m]()
    }
}
function indirect_bind(self) {
    // const $ = Object.create($_iter, {$: {value: self}})
    const $ = Object.create($_iter)
    $.$ = self
    $.log()
}

indirect_bind($_direct)

// add tests
suite
    .add('abs', function () {
        abs_direct()
    })
    // .add('obj', function () {
    //     direct_obj($_direct)
    // })
    // .add('indirect', function () {
    //     indirect($_direct)
    // })
    .add('indirect bind', function () {
        indirect_bind($_direct)
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
