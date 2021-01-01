const Benchmark = require('benchmark')
const layerCompose = require('../../lib').default

var suite = new Benchmark.Suite

const data = "this_obj"

function log(what) {
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

const C = layerCompose({
    method() {
        log("A", this)
    }
}, {
    method() {
        log("B", this)
    }
})
const c = C(data)

// add tests
suite.add('direct global', function () {
    twoLogs_global()
})
    .add('direct this', function () {
        twoLogs_this.call(data)
    })
    .add('layerCompose', function () {
        c.method()
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
