export const GLOBAL_DEBUG = {
    enabled: false
}

export function enableDebug() {
    GLOBAL_DEBUG.enabled = true

    printIntroduction()
}

function printIntroduction() {
    console.log(`
    o.$                  $_o
           Welcome
           
           This is
               layer-compose
    
    
    
    Happy crafting!
    
    
    
    Legend:
    >> Lens instantiated
    *  Property set
    ## Method called
    .  Method executed (one . per layer)
    `)
}
