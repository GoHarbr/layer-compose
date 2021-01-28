export const noSetAccessProxy = {
    set(target, prop) {
        if (typeof prop !== "symbol") {
            throw new Error('There is no set access on this object')
        } else {
            console.warn("No properties should be set on this object ")
        }
    }
}