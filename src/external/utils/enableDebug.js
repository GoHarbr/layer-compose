import { enableTypeStorage } from "../../auto-type/onExit"

export const GLOBAL_DEBUG = {
    enabled: false
}

export function enableDebug() {
    GLOBAL_DEBUG.enabled = true

    printIntroduction()
    enableTypeStorage()
}

function printIntroduction() {
    console.log(`
    o.$                       $_o
           Welcome
           
           This is
               layer-compose
    
    An minimal, opinionated, 
      architectural framework 
      for crafts women and other analogue people-engineers
    
    
    
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
