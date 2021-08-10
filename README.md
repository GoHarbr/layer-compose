![splash](./unsplash.jpg)

<p align="right">
Photo by <a href="https://unsplash.com/@mufidpwt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Mufid Majnun</a> on <a href="https://unsplash.com/t/textures-patterns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
</p>

<p align="center" style="font-size:20px">
<br/>
Lenses meet OO
</p>

--------

How do we write software that _**grows**_ easily, and how do we write it as a _**team**_?  

--------

*layerCompose* is a **safe** state management tool, with built in automatic checks  
*layerCompose* is a class composer: traditional classes meet **mixins**
  
*layerCompose* is a subset of JavaScript (opposite of a superset!): it **constrains** you (making it easier to work as a team) and counterintuitively gives you more **power** -- at Harbr, we've built a full UI rendering framework in <100 lines of code using *layerCompose + uhtml*  

## layerCompose

In a nutshell, *layerCompose* allows to assemble numerous functions in the form:
```javascript
    function fn ($ /* "super", like js `this` */, _ /* "core": like React props (but writable) */, opt /* additional named options */) {}
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
