![splash](./unsplash.jpg)

<p align="right">
Photo by <a href="https://unsplash.com/@mufidpwt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Mufid Majnun</a> on <a href="https://unsplash.com/t/textures-patterns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
</p>

<p align="center" style="font-size:20px">
<br/>
Lenses meet OO
</p>

<p align="center" style="font-size:20px">
<br/>
Or, look! Dependency injection meets Lenses, and Mixes-in with classic Object-oriented to form the backbone of data flow in your applications. 
</p>


--------

How do we write software that _**grows**_ easily, and how do we write that software in a _**team**_?  

--------

*layerCompose* is a **safe** state management tool, with built in automatic safety checks  
*layerCompose* is a class composer: traditional classes through **mixins**
  
*layerCompose* is a subset of JavaScript (opposite of a superset!): it **constrains** you (making it easier to work as a team) and 
counterintuitively gives you more **power** by letting you focus on the implementation and worry less about the architectural choices.  

## layerCompose

In a nutshell, *layerCompose* assembles numerous functions in the form:
```javascript
    function fn ($ /* "super", like js `this` */, _ /* "core": like React props (but writable) */, opt /* additional named options */) {}
```
in nested configurations
```javascript
/* Referred to as Composition */
const Class  = layerCompose(
        // top layer
    {
        generateConfig($,_) { console.log("top is generating") },
        
        Remote: [
            {
                send($,_,opt) { /* eg. if (opt.optKey === 1) ... */ }
            },
            {
                receive($,_,opt) {}
            }
        ]
    },
        
    // bottom layer
    {
        generateConfig($,_) { console.log("bottom is generating") },
    }    
)
```
into a _Composition_ that can be instantiated
```javascript
    const c = Class({})
    c.generateConfig() 
    // prints:
    // bottom is generating
    // top is generating
    
    c.Remote.send({optKey: optVal})
    c.Remote.receive()
```

### Why?

1. Mutable state management is notoriously prone to bugs.  
2. Writing code with multiple authors is notoriously prone to inconsistencies.  

## Learn

Start with the `tutorial` folder 

## Caveats
### Async
1. Uncaught promises (this is a big one for tests!)
