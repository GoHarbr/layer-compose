
How do we write software that grows easily, and how do we write it as a team?


*layerCompose* is a **safe** state management tool, with built in automatic checks
*layerCompose* is a class composer: traditional classes meet **mixins**  (easy refactor)
*layerCompose* brings the best of UI Component architecture (think React) to the rest of javascript for managing and encapsulating **state**  
  
*layerCompose* is **powerful** -- at Harbr, we've built a full UI rendering framework in <100 lines of code using *layerCompose + uhtml*

## layerCompose

In a nutshell, *layerCompose* allows to assemble numerous functions in the form:
```javascript
    function ($ /* "super", like js `this` */, _ /* "core": like React props (but writable) */, opt /* additional named options */) {}
```
in nested configurations
```javascript
/* Referred to as Composition */
    const Class  = layerCompose(
    {
        generateConfig($,_) { /* ... */ },
        
        Remote: {
            send($,_,opt) { /* eg. if (opt.optKey === 1) ... */ }
        }
    }
)

    const c = Class({})
    c.generateConfig()
    c.Remote.send({optKey: optVal})
```

### Why?

1. Mutable state management is nutoriosly prone to bugs.  
2. Writing code with mutliple authors is nutoriosly prone to incosistencies.  

### learn

Start with the `tutorial` folder

## Caveats
### Async
1. Uncaught promises (this is a big one for tests!)
