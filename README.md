![splash](docs/unsplash.jpg)

<p align="right">
Photo by <a href="https://unsplash.com/@mufidpwt?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Mufid Majnun</a> on <a href="https://unsplash.com/t/textures-patterns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
</p>

<p align="center" style="font-size:20px">
<img src="docs/logo.png"/>
Architecture Visualized (live)
<br/>
</p>

[//]: # ()
[//]: # (<p align="center" style="font-size:20px">)

[//]: # (<br/>)

[//]: # (Or, look! Dependency injection meets Lenses and Mixins to form the backbone of data flow in your applications. )

[//]: # (</p>)


--------

Lenses meet Reactive OOP for maintainable architectures

---

## `layer-compose` is born: I got tired of writing sh*tty code.


## Goals
- One way to do the same thing twice: creating predictable architecture patterns within and across teams
- Saf**er** mutable state: have the peace of mind as when working with *immutable* state
- **Ease when refactoring** architecture
- Ability to split classes into reusable components (mixins) / **clear separation of concerns**
- Ability to **visualize component relationships**
- **Predictable async**
- Handle work that can be done by a machine, by a machine: eg. automatically generate type definitions, 
create dataflow and class relationship diagrams
- Keep library surface and **learning curve minimal**


## Introduction

LayerCompose aims to improve code quality by removing a major source of bugs in Javascript dealing with state and providing
reusable, repeatable and predictable architectural pattern.

Classes are built up by combining layers (similar to [mixins](https://en.wikipedia.org/wiki/Mixin)) into `Compositions` so that the code can be minimal initially and build up over time.
`Lenses` provide extra functionality through composition, while keeping separation of concerns clear and maintaining context for Dependency Injection.

Predictable async is achieved by treating each instance of a `Composition` as a green thread, guaranteeing order of execution and access to the
mutable inner state (known as `core`). Reactivity is built into `Compositions` embodying an [Actor pattern](https://en.wikipedia.org/wiki/Actor_model).

*layerCompose* shines when implementing [Model-Controller](https://en.wikipedia.org/wiki/Model–view–controller) 
business logic of an application, especially when there are shifting and unpredictable requirements. 
*layerCompose* is in-between a language and a framework: while it is pure JavaScript it does have predefined naming conventions giving it a feel 
of a *sub*set of JavaScript. 

The end result is full expressiveness of JS for implementing logic and control flows within a Composition, 
with [declarative](https://en.wikipedia.org/wiki/Declarative_programming) style when outlining the execution of the entire application.  

## layerCompose

![diagram1](docs/layer-compose.png)

In a nutshell, *layerCompose* assembles numerous functions in the form:
```javascript
    function fn (
        $ /* "super" akin to `this` */, 
        _ /* "core": mutable state */, 
        o /* named arguments */) {}
```
in nested configurations
```javascript
/* Referred to as Composition */
const Apple = lc()

/* a `layer` */
Apple._sweetness /* _type is a `layer` name tag for improved visualization */ = {
    /* constructor function */
    $($,_) {
        defaults(_, {sweetnessLevel: 0.1})
    },
  
    grow($,_,o) {
        if (o.sunshineLevel > 0.5) {
            _.sweetnessLevel += 0.3        
        }
    }
}

/* another `layer` */
Apple._offspring = {
    $($,_) {
        defaults(_, {canHaveOffspring: false}) // `core` cannot contain `undefined` values,
    },
  
    // notice that the `layer` above has a function with the same name
    // both will be executed when calling `apple.grow()` (read more about execution order in the "Deep Dive" section)
    grow($,_,o) {
      _.maximumSeedCount = o.sunshineLevel * _.sweetnessLevel * 20
    },
  
    /* 
    `accessor` -- the only way to expose `core` values to the outside 
    note the notation: must start with `_` followed by a capital letter
     */
    _MaximumSeedCount: (_) => _.maximumSeedCount,
    
    /* Defining a `Lens` */
    Seeds: {
        _($,_,o) {
            _.thresholdModifier = o.isColdWinter ? 0.5 : 1 // if the winter is cold, less seeds will sprout 
        },
        $($,_) {
            defaults(_, {seeds: []})
            $.setSeedCount()
            $.generateSeeds()
        },
      
        setSeedCount($,_,o) {
            if (o.seedCount) {
                _.seedCount = Math.round(o.seedCount * _.thresholdModifier)
            } else {
              // dependency injection: looking up the context chain (parental chain) to find the first Apple type Composition
              // `return` forces the `Seeds` Composition to suspend until the dependency injection is complete

              return Apple($, parentApple => {
                _.seedCount = Math.round(parentApple._MaximumSeedCount * _.thresholdModifier)
              })    
            }
        },
      
        * generateSeeds($,_) {
            for (let i = 0; i < _.seedCount; i++) {
              // suspending `Seeds` composition instance until all the seeds are instantiated  
              yield $.Seed({birthOrder: i}, seed => {
                  _.seeds.push(seed)
              })   
            }
        },
      
        sprout($,_) {
            // suspends `Seeds` composition until all seeds sprout
            return _.seeds.map(s => s.sprout())  
        },
        
        /* Defining another `Lens` */
      
        Seed: {
            $($, _) {
              setTimeout($.sprout, _.birthOrder * 1000)
            },
            sprout($,_) { /* ... */ }
        }
    }
}

```

into a _Composition_ that can be instantiated using a [declarative](https://en.wikipedia.org/wiki/Declarative_programming) approach

```javascript
    Apple({sweetnessLevel: 0.2 /* override the default */}, 
        apple => { // callback after the constructor completes
            apple.grow({sunshineLevel: 0.8})
          
            apple.Seeds({}, seeds => { // callback runs after the Lens constructor completes
                seeds.sprout() // calls upon each `Seed` to `sprout()`
            })
    })
```

## Features
- ***Borrow checks***: ensuring that only a single layer has write access to specific key-value pair 
- Simple and powerful ***Dependency Injection*** 
- ***Execution thread per composition*** ensuring sequential execution even for async functions
- Generated composition ***relationship diagrams***, visualizing program execution  
  ![architecture-visualized](docs/example-architecture-visualized.png)
- ***Auto type*** -- automatic typing for functions and interfaces (works well to be useful, will be improved with demand).
  Generates [flow.js](https://flow.org) types without a single manual input.  
  ![auto-type](docs/auto-type.png)

## Deep dive

![diagram-accessors](docs/layer-compose-accessors.png)


## Layer

A POJO is built up as layers with each layer able to mutate a section of the POJO’s state, also called the core.  Each layer is mutually exclusive.  


## Lense 

Adds functionality and has access to the core.  Can also be a layer with its own core.

## External Interface

Functions that can be called on the pojo to access or mutate state.

## Example

Lets look at a shopping cart which consists of information related to the cart, items in the cart and the user who owns the cart.

Lets create an item that just has an id and a name

```
const Item = lc() //create the layer
Item._ = _id // add an id to the core.  The underscore is the accessor for the core
Item._ = _name // add a name property
``` 

Lets create a cart where we can add some items

```
const Cart = lc()
```

## Related work

###Trait libraries
- [Straits](https://straits.github.io/introduction/) (not in active development): Babel-compiled traits syntax for javascript, 
allowing to mix in new functions into existing objects. Main focus seems to be creating pipelines (eg: map, reduce, filter)

- [Traits.js](https://github.com/traitsjs/traits.js) (not in active development): Readme overviews traits, comparing traits and mixins.
Has concepts of required trait methods and conflicting methods.

### Reactive libraries

- [rxjs](https://rxjs.dev/guide/overview): popular JS reactive programming library. [Fluh](https://github.com/StreetStrider/fluh) provides a 
friendlier introduction into reactive JS. 
- [Fluh](https://github.com/StreetStrider/fluh): constructing reactive dependency graphs. Simplified FRP

### State libraries
- [Raj](https://jew.ski/what-is-raj/) (complete solution in 34 lines of code): Simpler and scalable redux
- [Immer](https://github.com/immerjs/immer): State management through immutability 

### Papers
- [Scalable Component Abstractions](http://lampwww.epfl.ch/~odersky/papers/ScalableComponent.pdf): Components in Scala


## License
Modified GNU AGPLv3.

-----

### Contributors:
- Anton Kats
- Hamish Anderson

### Sponsors:<br/>
<a href="https://harbr.com"><img src="https://www.harbr.com/wp-content/uploads/2022/01/blackonlightWordmark_pipe-1.png" width="100"/></a>

