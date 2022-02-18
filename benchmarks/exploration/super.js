let data = 'initial_data'; // watch out this creates a singleton!

const services = {
    data: {
        setData(d) {data = d},
        getData() {return 'data'}
    },
    watcher: {
        watchMethod(key, ...params) {
            console.log('detected', key, ...params)
        }
    }
}


/*
* Does not actually work, first attempt. Relevant answer:
* https://stackoverflow.com/questions/37189387/using-super-in-an-object-created-with-object-create
* */

const DataBin = Object.create(services)
Object.assign(DataBin, {
    setData(d) {
        // super.watcher.watchMethod(super.data.setData.name, d)
        // super.data.setData(d)
    }
})

DataBin.setData('new_data')


/* Also does not work */

dataHolderLayer = {
    setData(d) {
        // super.watcher.watchMethod(super.data.setData.name, d)
        // super.data.setData(d)
    }
}
let DataHolder = Object.create({
    __proto__: services,
    ...dataHolderLayer
})

DataHolder.setData('new_data')


/* This does */

DataHolder = Object.create({
    __proto__: services,
    setData(d) {
        super.watcher.watchMethod(super.data.setData.name, d)
        super.data.setData(d)
    }
})

DataHolder.setData('new_data')
// data becomes set to 'new_data'
// console logs `detected 'setData' 'new_data'`


/* And this */

dataHolderLayer = {
    setData(d) {
        super.watcher.watchMethod(super.data.setData.name, d)
        super.data.setData(d)
    },

    thisCanBeAnything() {
        super.data.setData('super_still_works')
        console.log(this)
    }
}
DataHolder = Object.create(dataHolderLayer)
// Object.setPrototypeOf(DataHolder, services)
// Does not work since DataHolder is an empty object with prototype set to dataHolderLayer

Object.setPrototypeOf(dataHolderLayer, services) // this is an expensive and potentially deoptimizing
                                                 // some form of caching will be required
DataHolder = Object.create(dataHolderLayer)

DataHolder.setData('proto_data')
DataHolder.thisCanBeAnything.call({"this_can_be_changed": "yes"})
console.log(DataHolder.data)

/* Regulating super access  */


let hasNoSuperAccess = true
const protectedServices = new Proxy(services, {
    get(target, prop) {
        if (hasNoSuperAccess === true) {
            throw new SyntaxError('Access to super is only allowed for layers directly above a services object.' +
                ' Regular layers cannot be accessed through `super`')
        }
        return target[prop]
    }
})


Object.setPrototypeOf(dataHolderLayer, protectedServices)

DataHolder = Object.create(dataHolderLayer)
try {
    DataHolder.setData('proto_data')
} catch (e) {
    console.log(e)
    // and now super access will work
    hasNoSuperAccess = false
    DataHolder.setData('with_access')
}
