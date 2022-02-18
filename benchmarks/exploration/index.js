const isFunction = function (obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply)
}

function _composeChain(chain, composition = []) {
    // const layers = []
    const methods = chain.reduceRight((acc, layerSpec, i) => {
        const layer = _compose(layerSpec, composition)
        composition.unshift(layer)
        // layers[i] = layer
        return Object.assign(acc, layer)
    }, {})

    // override functionality
    Object.keys(methods).forEach(name => methods[name].override = function () {
        throw new Error('Not Implemented')
    })

    return methods
}

function _composeServices(services, composition) {
    Object.keys(services).forEach(key => {
        if (services[key]._spec) services[key] = _compose(services[key], composition)
    })
    return services
}

function _compose(spec, composition = []) {
    if (Array.isArray(spec)) {
        return _composeChain(spec, composition)
    } else if (isFunction(spec)) {
        if (spec._spec) {
            return _compose(spec._spec, composition)
        } else {
            return spec(composition[0])
        }
    } else {
        return _composeServices(spec, composition)
    }
}

function _bind(methodsAndServices, contents) {
    const ms = methodsAndServices

    ms[key].call(obj_to_be_bound_as_this, [...params])
    ms[key].apply(obj_to_be_bound_as_this, param1, param2, param3)

    const boundF = ms[key].bind(obj_to_be_bound_as_this)-

    Object.keys(ms).forEach(key => {
        if (ms[key].bind) {
            ms[key] = ms[key].bind(contents)
        } else {
            _bind(ms[key], contents)
        }
    })
}

function layerCompose(spec) {
    const methods = _compose(spec)

    const composed = (contents) => {
        _bind(methods, contents)

        // proxy the contents for write protection
        // return Object.setPrototypeOf(contents, Object.create(methods))
        return Object.setPrototypeOf(methods, contents)
    }
    composed._spec = spec

    return composed
}


const A = layerCompose([{
    multiply: function () {
        return this.x * this.y
    }
}, {
    divide: function () {
        return this.x / this.y
    }
}])

const a = A({x: 1, y: 2})
console.log("Simple layering", a.x, a.y, "|", a.multiply(), a.divide())


const B = layerCompose([{
    getRemainder() {
        return this.x % this.y
    }
},
    A
])

const b = B({x: 10, y: 3})
console.log("Extension", b.x, b.y, "|", b.multiply(), b.divide(), b.getRemainder())

// todo. no need to pass an array: layerCompose(constructor, ...layers)
// or lC(...layers).withConstructor(f)
const C = layerCompose([(services) => {

    // just for fun
    let runCount = 0

    return {
        remainderRatio() {
            runCount++
            return services.B.getRemainder() / services.B.multiply() * runCount
        }
    }

    // return super would be great
},
    {B}
])

const c = C({x: 10, y: 3})
console.log("Extension", c.x, c.y, "|", c.remainderRatio(), c.remainderRatio())

// logs
// Simple layering 1 2 | 2 0.5
// Extension 10 3 | 30 3.3333333333333335 1
// Extension 10 3 | 0.03333333333333333 0.06666666666666667

// could also add a bind() here so that we don't have to reparse the chain
