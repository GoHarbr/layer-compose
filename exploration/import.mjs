/*
* Exploration around using modules with layerCompose
* Modules are basically singletons, which is an issue
* */

import * as Module1 from './m.mjs'
import * as Module2 from './m.mjs'

// https://nodejs.org/api/modules.html#modules_caching
// const cache = require.cache

console.log('Initial', Module1.a, Module2.a)

Module1.incA()
console.log('Change only one', Module1.a, Module2.a)

const Copy = {...Module1}
Module1.incA()
console.log('Copy should not change, but originals should', Module1.a, Module2.a, Copy.a)

/* Does not work: affects both Module1 and Module2 but not Copy */

Copy.incA.bind(Copy)()
console.log('Copy should change, but not originals', Module1.a, Module2.a, Copy.a)


async function dynamic() {
    /* queries work!
    * The returned modules aren't cached
    *  */
    const M1 = await import('./m.mjs?i=1')
    const M2 = await import('./m.mjs?i=2')
    console.log('Initial', M1.a, M2.a)

    M1.incA()
    console.log('Change only one', M1.a, M2.a)
}

dynamic()
