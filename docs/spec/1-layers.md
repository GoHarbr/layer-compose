A Layer can be 

a. An object with functions as values

```javascript
const layer = {
    methodA() {},
    methodB() {},
    methodC() {}
}
```

b. A function that returns an object as in `a.`
```javascript

function layer (borrow) {
    borrow.key = false // see more in data-encapsulation.md

    return {
        methodA() {
            commonFunction()
        },
        methodB() {
            commonFunction()
        },
        methodC() {
            this.key = true
        }
    }
}
function commonFunction() {
    /* that does not rely on state/data directly */
}

```

https://jsben.ch/7Pgxg

Layers are NOT allowed to access other layers; @see initializers-aka-constructors.md

### Overrides

A method in a layer can return either an object or `undefined`. All other values are illegal.  
This allows for the following **default** override strategy

```javascript
const C = layerCompose(
    {
        method() {
            return
        }   
    },
    {
        method() {
            return {key1: 'value'}
        }   
    },
    {
        method() {
            return {key2: 'value'}
        }   
    }
)

/* C is equivalent to the following */

function _C (data) {
    function method(...params) {
        return [L1.method(...params), L2.method(...params), L3.method(...params)]
            .filter(_ => _ != undefined)
            .reduce((acc, res) => {
                Object.assign(acc || {}, res)
                return acc
            })
    }

    return {
        method: method.bind(data)
    }
}
```

@see initializers-aka-constructors.md for more on overrides
