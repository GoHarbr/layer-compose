// make sure type does not change during execution

const definedGetProxy = {
    get(target, prop) {
        const v = target[prop]
        // null is a valid optional value
        return v !== undefined ? v : throw new Error('Property does not exist: ' + prop)
    }
}
const borrowProxy = (keys) => ({
    ...definedGetProxy,

    set(target, prop, value) {
        if (!keys.includes(prop)) {
            throw new Error('Must borrow to be able to set a prop\'s value on: ' + prop)
        }

        target[prop] = value
        return true
    }
})

export default function wrapWithProxy(over, borrow, {isGetOnly}) {
    if (typeof isGetOnly !== 'boolean') throw new Error('Must specify if getOnly on proxy')

    if (typeof over === 'object' && typeof borrow === 'object') {
        for (const k of Object.keys(over)) {
            over[k] = wrapWithProxy(over[k], borrow[k], {isGetOnly})
        }

        if (isGetOnly === true) {
            return new Proxy(over, definedGetProxy)
        } else {
            return new Proxy(over, borrowProxy(Object.keys(borrow)))
        }
    }

    /* return the passed in value; useful for recursion */
    return over
}
