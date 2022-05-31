import { enableTypeStorage } from "../diagrams/__old/onExit"
import { printDeadlocks } from "./printDeadlocks"
import { startDevServer } from "../diagrams/server"

export const GLOBAL_DEBUG = {
    enabled: false,
}

export function enableDebug({writeTypes = false, logTypes, trackDeadlocks = false, map = true} = {}) {
    GLOBAL_DEBUG.enabled = true

    // probably @deprecated
    GLOBAL_DEBUG.writeTypes = writeTypes
    GLOBAL_DEBUG.trackDeadlocks = trackDeadlocks
    GLOBAL_DEBUG.map = map

    GLOBAL_DEBUG.logTypes = Object.assign({
        propertySet: GLOBAL_DEBUG.enabled,
        propertyRead: GLOBAL_DEBUG.enabled,
        accessorCall: GLOBAL_DEBUG.enabled,
        methodCall: GLOBAL_DEBUG.enabled,
        methodExecuted: GLOBAL_DEBUG.enabled,
        coreUpdate: GLOBAL_DEBUG.enabled,
        singleton: GLOBAL_DEBUG.enabled,
        lens: GLOBAL_DEBUG.enabled,
        dependency: GLOBAL_DEBUG.enabled,
    }, logTypes)

    printIntroduction()
    if (writeTypes) enableTypeStorage()
    if (trackDeadlocks) printDeadlocks(typeof trackDeadlocks == 'number' ? trackDeadlocks : null)
    if (map) startDevServer()

    Object.freeze(GLOBAL_DEBUG)
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
    
    *   Accessor called
    ~~  Method called
    .   Method executed (one . per layer)
    ()  Updated issued
    
    @@  Singleton loaded (first access)
    @   Singleton loaded
    |>> Lens instantiated
    <<| Dependency injected
    `)
}
