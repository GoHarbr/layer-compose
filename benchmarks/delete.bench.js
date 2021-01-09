/*
* Records
* layerCompose x 9,103,012 ops/sec ±0.53% (86 runs sampled) -- JAN 9, 2021
* */

const Benchmark = require('benchmark')
var suite = new Benchmark.Suite

const {default: layerCompose, IS_DEV_MODE} = require('../lib')

console.log('IS_DEV_MODE', IS_DEV_MODE)


const data = {key: 'value'}

function log(what) {
    // console.log(what)
    return what
}

const deleteData = Object.create(data)

function setByDelete() {
    data.key = 'value'
    delete deleteData.key
    deleteData.key = deleteData.key + "overridden"
    log(deleteData.key)
}

const callData = Object.create(data)

function _getter() {
    return callData.key
}

function setByGetter() {
    data.key = 'value'
    callData.key = _getter() + "overridden"
    log(callData.key)
}

const C = layerCompose({
    service: [{
        method(d) {
            delete d.key
            d.key = d.key + "overridden"
            log(d.key)
        }
    }]
})
const c = C(data)


suite
    .add('setByGetter', function () {
        setByGetter()
    })
    .add('setByDelete', function () {
        setByDelete()
    })
    .add('layerCompose', function () {
        c.service.method()
    })

    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target))
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'))
    })
    .run({'async': false})
