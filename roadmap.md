- babel
    - read function call and convert (arg1, arg2) into {arg1, arg2}

- async
    - if constructor is async, check that `.then()` is called within 100ms

- internal interface
    - private state
    - live transforms / lenses
    - verify $ methods exist (if yes, disallow getting same value through _)
    
- external interface
    - private method
  - warn when accesing an internal var when an external accessor is available (on a different layer)
  
- services
  - make runtime additions lazy
  - disallow runtime additions to be a different Composition from pre-defined service   
  <s>core object should be `_.ServiceName` from parent</s>

- composition
  ---- fix: double include of common layers/compositions
  - Production mode per instantiation (useful for testing)
  - casting (when wrapping over itself)
  - test: services should not be reused between instances 
    


# Needs thought
  - when exposing using boolean notation (eg {key: true}) check that there's not already a setter / getter.
