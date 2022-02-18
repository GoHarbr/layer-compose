const Benchmark = require('benchmark')

const data1 = {key: 'value'}
const data2 = {key2: 1}

const comp = {}
function New(composition, core) {
        const i = Object.create(composition)
        i.core = core
        return i
}

// New({f1(){}}, {k:'v'})

const create = Object.create
let id = 1
const protos = []
Object.create = (p) => {
   if (!p.id) {
       p.id = id++
       protos[p.id] = p
   }

}

const c1 = () => Object.create({f1(){}})
const c2 = () => Object.create({f2(){}})
const c3 = () => Object.create({f3(){}})
const c4 = () => Object.create({f4(){}})
const c5 = () => Object.create({f5(){}})
const c6 = () => Object.create({f6(){}})
var suite = new Benchmark.Suite
suite
    .add('', function () {
        c1()
    })
    .add('', function () {
        c2()
    })
    .add('', function () {
        c3()
    })
    .add('', function () {
        c4()
    })
    .add('', function () {
        c5()
    })
    .add('', function () {
        c6()
    })
    .add('', function () {
        c1()
    })
    //
    // .add('', function () {
    //     New(() => c1, {k:'v'})
    // })
    // .add('', function () {
    //     New(() => c2, {z:'v'})
    // })
    // .add('', function () {
    //     New(() => c3, {k:1})
    // })
    // .add('', function () {
    //     New(() => c1, {k:1})
    // })

    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
