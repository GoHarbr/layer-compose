1. `layerCompose` generates a function that takes a `data` object and wraps methods around it
    ```javascript
    const data = {key: 'v'}
    
    const Wrapper = layerCompose({get() {return this.key}})
    
    const wrapped = Wrapper(data)
    
    wrapped.get() // returns 'v'
    ```

2. Methods access `data` through `this`. That is the only way to access it.
    **Methods introduced with layerCompose cannot be accessed thorough `this`!  
    If, however, `data` itself has methods they can accessed through `this`**

3. If a `this.key === undefined` throw an error. All accessed values on the `data` object must be defined (or `null`)

4. Only one layer can set a particular key on `data`. It must BORROW the value by giving it a default.  
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

5. When a data object is wrapped with `layerCompose`, in Dev mode it is protected from outside access:  
- `data` object is frozen to prevent unauthorized writes from outside
- accidental reads are also protected: calling `data.key` throws an error if `data.key` is `undefined`
```javascript
const data = {prop: ''}

const Wrapper = layerCompose(/*...*/)

const wrapped = Wrapper(data)

data.key // throws
data.key = '' // throws

data.prop // is fine
```

6. `data` object should not have its prototype modified, and could be continued to use as a Plain Old JS Object.
In example above, while `Wrapper` is aware of `data`, `data` is not aware of `Wrapper`. 
