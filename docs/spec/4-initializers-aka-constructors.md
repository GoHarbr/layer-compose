An intializer is a function ...
All initializers in `layerCompose` are static in a sense that they don't have direct access to the underlying data object/state.  
They are called during the constuction of the factory, and thus can be cached

### Overriding
```javascript

const C = layerCompose(  
    (_super) => {
        _super.method.override(layers => {
            layers[0].method({option: true})
            layers[1].method()
            // this reverses the default override order
            // and adds a static `option` value 
        })

        _super.validate() // call is recorded (not actually executed) in the factory; ran on initialization
    },
    {
        validate() {},
        method() {}
    },
    {
        method({option}) {}
    }
)

const instance = C({}) // validate() runs at this point

```

### Narrowing data scope

```javascript
const Task = layerCompose(
    function(_super) {
        _super.domManager.narrowData(
            data => data.dom       
        ) // resembling Redux
    },
    {
        dataManager: [relationManager, dataManager],
        domManager: [subtaskDom, dom],
        // or maybe more appropriately `dom` and `data` (omitting manager) 
    }
)

Task({prop: '', dom: {elem: ''}}) // domManager will operate on the subset (data.dom) of the passed in data
```

### 
