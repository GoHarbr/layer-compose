/*
* Records
* layerCompose x 13,666,647 ops/sec ±0.78% (83 runs sampled)
* */

const Benchmark = require('benchmark')

var suite = new Benchmark.Suite

const x = 1
const o = Object.create({
    get x() {
        return x
    }
})

const co = Object.create(
    Object.create(null, {
        x: {
            get: () => x
        }
    })
)

function get () {
    return x
}
const arrow = () => x

console.log(o.x)
console.log(co.x)

suite
    .add('direct', function () {
        return x
    })
    .add('getter', function () {
        return o.x
    })
    .add('getter (create)', function () {
        return co.x
    })
    .add('function', function () {
        return get()
    })
    .add('arrow function', function () {
        return arrow()
    })
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
