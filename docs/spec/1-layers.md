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
function layer () {
    let internalState;

    function commonFunction() {}

    return {
        methodA() {
            commonFunction()
        },
        methodB() {
            commonFunction()
        },
        methodC() {
            internalState = true
        }
    }
}
```
