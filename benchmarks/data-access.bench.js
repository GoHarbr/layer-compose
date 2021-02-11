const Benchmark = require('benchmark')

var suite = new Benchmark.Suite


const d = {key1: 'v', key2: 'v', key3: 'v'}

function assign() {
    Object.assign({}, d)
}

function copy() {
    const o = {}
    o.key1 = d.key1
    o.key2 = d.key2
    o.key3 = d.key3
}

const C = {
    key: 'v', direct(v) {
        this.key = v
        return this.key
    }
}

const g = {record: {key: 'v'}}

function indirect(v) {
    g.record.key = v
    return g.record.key
}

console.log(C.direct())
console.log(indirect())

// add tests
suite
    .add('copy', function () {
        copy('v')
    })
    .add('assign', function () {
        assign()
    })
    .add('direct', function () {
        C.direct('v')
    })
    .add('indirect', function () {
        indirect('v')
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
