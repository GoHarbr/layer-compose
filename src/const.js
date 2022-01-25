export const IS_DEV_MODE = process.env.NODE_ENV !== 'production'

if (IS_DEV_MODE) {
    console.warn("layerCompose symbols loaded. You should see this message only once. Check your bundler (ie: webpack) configuration otherwise")
}

export const $isLc = Symbol('isLc')
export const $compositionId = Symbol('compositionId')
export const $isCompositionInstance = Symbol("isCompositionInstance")
export const $getComposition = Symbol("getComposition")

export const $isService = Symbol('isService')
export const $lensName = Symbol('lensName')
export const $fullyQualifiedName = Symbol("fullyQualifiedName")
export const $tag = Symbol("tag")

export const $dataPointer = Symbol('dataPointer')
export const $isNullCore = Symbol('nullCore')
export const $parentInstance = Symbol('parentComposition')
export const $isComposed = Symbol('isComposed')

export const $isInitialized = Symbol()
export const $importsComplete = Symbol('importComplete')

export const $composition = Symbol('composition')
export const $layers = Symbol("layers")
export const $layerOrder = Symbol("layerOrder")

export const $dataProxyMap = Symbol('dataProxyMap')
export const $borrowedKeys = Symbol('borrowedKeys')
export const $writableKeys = Symbol('writableKeys')

export const $layerId = Symbol("layerId")
export const $at = Symbol("at")


export const $executionQueue = Symbol('executionQueue')
export const $currentExecutor = Symbol('currentExecutor')

// export const $isSetter = Symbol("isSetter")
// export const $isGetter = Symbol("isGetter")
