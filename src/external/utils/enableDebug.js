export const GLOBAL_DEBUG = {
    enabled: false
}

export function enableDebug() {
    GLOBAL_DEBUG.enabled = true

    printIntroduction()
}

function printIntroduction() {
    console.log(`
    o.$                       $_o
           Welcome
           
           This is
               layer-compose
    
    An opinionated, minimalist 
      architectural framework 
      for crafts women and other analogue monkeys
    
    
    
    Happy crafting!
    
    
    
    Legend:
    -   Property set
    +   Property read
    
    *   Getter called
    ~~  Method called
    .   Method executed (one . per layer)
    
    |>> Lens instantiated
    <<| Dependency injected
    `)
}
