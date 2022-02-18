const Benchmark = require('benchmark')

const data1 = {key: 'value'}
const data2 = {key2: 1}

function buildNamedConstructor(composed) {
    function constr(data) {
        const i = Object.create(composed)
        i.data = data
        return i
    }

    constr.composed = composed
    return constr
}

const share1with3 = {f1() {return 1}}
const named1 = buildNamedConstructor(share1with3)
const named2 = buildNamedConstructor({f2() {return 'hello'}})
const named3 = buildNamedConstructor({f3() {return true}})


var suite = new Benchmark.Suite
suite

    .add('named1-data1-first-run', function () {
        named1(data1)
    })
    .add('named-data2-second-run', function () {
        named2(data2)
    })
    .add('named-data1-third-run', function () {
        named1(data1)
    })
    .add('named-data1-third-run', function () {
        named3(data1)
    })
    .add('named-data1-third-run', function () {
        named1(data1)
    })
    .add('named-data1-third-run', function () {
        named1(data2)
    })

    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
