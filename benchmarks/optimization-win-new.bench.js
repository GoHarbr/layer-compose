const Benchmark = require('benchmark')

const data1 = {key: 'value'}
const data2 = {key2: 1}

function build(composition) {
    const instance = Object.create(composition)

    composition.new = (core) => {
        const i = instance
        i.core = core
        return i
    }
    return composition
}

// New({f1(){}}, {k:'v'})

const c1 = build({f1(){}})
const c2 = build({f2(){}})
const c3 = build({f3(){}})
const c4 = build({f4(){}})
const c5 = build({f5(){}})
const c6 = build({f6(){}})

var suite = new Benchmark.Suite
suite

    .add('', function () {
        c1.new({k:'v'})
    })
    .add('', function () {
        c2.new({z:'v'})
    })
    .add('', function () {
        c3.new({z:'v'})
    })
    .add('', function () {
        c1.new({key:true})
    })
    .add('', function () {
        c4.new({key:true})
    })
    .add('', function () {
        c5.new({key:true})
    })
    .add('', function () {
        c6.new({key:true})
    })
    .add('still fast?', function () {
        c1.new({key:true})
    })
    .add('', function () {
        c2.new({key:true})
    })
    .add('', function () {
        c4.new({key:true})
    })
    .add('', function () {
        c5.new({key:true})
    })
    .add('', function () {
        c6.new({key:true})
    })

    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
