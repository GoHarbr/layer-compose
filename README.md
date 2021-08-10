<p style="height:50px; width: 100%; background-image: url('https://unsplash.com/photos/tYRqsndCbEw/download?force=true&w=640')">
</p>

<p align="center">
Photo by <a href="https://unsplash.com/@mufidpwt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Mufid Majnun</a> on <a href="https://unsplash.com/t/textures-patterns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
</p>

<div style="font-size:2em; text-align: center">
Lenses meet OO
</div>

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
