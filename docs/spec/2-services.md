_layerCompose_ helps with composing services together

Given these layers
```javascript
const dom = {
    render() {}
}
const subtaskDom = {
    renderSubtask() {}
}

const dataManager = {
    loadSubtasks () {},
    setData() {}
}
const relationManager = {
    filterSubtasks() {}
}
```

We can combine them
```javascript
const Task = layerCompose(
    {
        show() {
            const subtasks = super.dataManager.loadSubtasks()
            super.subtaskDom
        }       
    },
    {
        dataManager: [relationManager, dataManager],
        domManager: [subtaskDom, dom],
        // or maybe more appropriately `dom` and `data` (omitting manager) 
    }
)
/*
    Which returns (dataObj) => ..... [to complete this section]
*/ 
```

A caveat about the use of `super`:
`super` can only be used when a layer is directly on top of a service object

A service object, eg:
```javascript
const servicesObject = {
    dataManager: [relationManager, dataManager],
    domManager: [subtaskDom, dom],
}
/*
A object in a shape
{key: [...layers]} @see layers for their shapes
*/
```

So this would not be valid, and should throw an error (in dev mode)
@see exploration/super.js
```javascript
layerCompose(
{
    top() {
        super.bottom() // throws an error
    }
}, 
{
    bottom() {}
})
```


### Composability
```javascript
layerCompose({
                 dataManager: [relationManager, dataManager],
                 domManager: [subtaskDom, dom],
             })

// is same as

layerCompose({
                 dataManager: layerCompose(relationManager, dataManager),
                 domManager: layerCompose(subtaskDom, dom),
             })

```
