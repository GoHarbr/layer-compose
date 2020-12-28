1. `layerCompose` generates a function that takes a `data` object and wraps methods around it
    ```javascript
    const data = {key: 'v'}
    
    const Wrapper = layerCompose({get() {return this.key}})
    
    const wrapped = Wrapper(data)
    
    wrapped.get() // returns 'v'
    ```

2. Methods access `data` through `this`. That is the only way to access it.

3. If a `this.key === undefined` throw an error. All accessed values on the `data` object must be defined (or `null`)

3. Only one layer can set a particular key on `data`. It must BORROW the value by giving it a default.  
If another layer tries to borrow the same key `layerCompose` throws an error.
    ```javascript
    const layer = function (borrow) {
       borrow.key = ''
       borrow.optionalKey = null
       borrow.mustBePresentInData = undefined
       // setting the default value to `undefined` is valid
       // as long as it is !== `undefined` on the passed in `data` object 
   
       return {
           set() {
               this.key = 'v'
               this.notBorrowed = '' // throws, since this key was not borrowed
           }       
       }
   }
    ```

4. When a data object is wrapped with `layerCompose`, it should not be extended or replaced.
```javascript
const data = {}

const Wrapper = layerCompose(/*...*/)

const wrapped = Wrapper(data)

/* `data` should still refer to the same object, with the same prototype */
```
The caveat to this rule is that in DEV mode, `data` object is frozen to prevent unauthorized writes from outside
