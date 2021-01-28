export const IS_DEV_MODE = process.env.NODE_ENV !== 'production'

export const $isLc = Symbol('isLc')
export const $lcId = Symbol('lcId')
export const $isLcData = Symbol()

export const $isService = Symbol('isService')
export const $dataPointer = Symbol('dataPointer')
export const $extendSuper = Symbol('extendSuper')
export const $runOnInitialize = Symbol('runOnInitialize')

export const $initializer = Symbol()
export const $isInitialized = Symbol()
export const $setData = Symbol()
export const $functionSymbolIds = Symbol('array-of-function-symbol-ids')

export const $spec = Symbol()
export const $composition = Symbol()

export const $dataProxyMap = Symbol('dataProxyMap')
export const $borrowedKeys = Symbol('borrowedKeys')

export const $layerId = Symbol()
export const $$ = Symbol('$$')
